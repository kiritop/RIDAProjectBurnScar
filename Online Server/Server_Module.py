# Related third party imports.
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import pickle
import os
import geopandas as gpd
import reverse_geocoder as rg
import pycountry
import pymysql
from shapely.geometry import MultiPoint
from collections import Counter
from IPython.display import display
from sklearn import metrics
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, silhouette_score
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, StratifiedKFold, KFold, cross_val_predict
from sklearn.cluster import KMeans, DBSCAN
from sqlalchemy import create_engine

pd.set_option('display.max_columns', None)

def preprocess(df, scaler_path):
    """
    Preprocess the data for classification tasks.

    Args:
        df (pandas.DataFrame): DataFrame containing the data.
        drop_columns (list, optional): List of column names to drop from the feature data.
        scaler_path (str): Path to the scaler pickle file.

    Returns:
        tuple: A tuple containing:
            - df_rename (pandas.DataFrame): Normalized and renamed feature data.
            - lat (pandas.Series): Latitude column.
            - long (pandas.Series): Longitude column.
    """
    drop_columns = ['Tile', 'Date', 'Latitude_WGS84', 'Longitude_WGS84']

    # Print a list datatypes of all columns
    print("Datatypes of all columns: ")
    print(df.dtypes)
    print() # Add Blank Line

    # Check Missing Value
    print("Check Missing Value: ")
    print(df.isnull().sum())
    print() # Add Blank Line

    # Extract latitude, longitude and fire date columns including rename columns
    lat = pd.DataFrame(df['Latitude_WGS84'])
    lat = lat.rename(columns={lat.columns[0]: 'LATITUDE'})
    
    long = pd.DataFrame(df['Longitude_WGS84'])
    long = long.rename(columns={long.columns[0]: 'LONGITUDE'})
    
    fire_date = pd.DataFrame(pd.to_datetime(df['Date'], format='%Y%m%d'))
    fire_date = fire_date.rename(columns={fire_date.columns[0]: 'FIRE_DATE'})

    # Drop specified columns
    df = df.drop(columns=drop_columns)

    # Print a list datatypes of all columns
    print(df.dtypes)

    # Check Missing Value
    print(df.isnull())

    # Load scaler object from pickle
    with open(scaler_path, 'rb') as f:
        scaler = pickle.load(f)

    # Transform data using loaded scaler
    df_nor = scaler.transform(df)
    df_nor = pd.DataFrame(df_nor, columns=df.columns)

    # Rename Features dynamically
    remaining_features = [col for col in df.columns if col not in drop_columns]
    df_rename = df_nor.rename(columns=dict(zip(df_nor.columns, remaining_features)))

    # Display Data
    print('\033[1m'+"Normalized and Renamed DataFrame is Dataframe that contain Sentinel Band value which is ready to perform Prediction : ")
    display(df_rename)
    print('\033[1m'+"Latitude Column separated from entire dataframe for use to combine with Predicted Dataframe : ")
    display(lat)
    print('\033[1m'+"Longitude Column separated from entire dataframe for use to combine with Predicted Dataframe : ")
    display(long)
    print('\033[1m'+"Fire Date Column separated from entire dataframe for use to specify Fire Date and combine with Predicted Dataframe : ")
    display(fire_date)
    
    #return df_rename, lat, long, fire_date
    return df_rename, lat, long, fire_date

def load_models(directory):
    """
    Load pre-trained models from pickle files in a directory.

    Args:
        directory (str): Path to the directory containing the pre-trained model pickle files.

    Returns:
        dict: A dictionary containing the loaded models, with file names as keys and loaded models as values.
    """

    for filename in os.listdir(directory):
        if filename.endswith(".sav"):
            file_path = os.path.join(directory, filename)
            loaded_model = pickle.load(open(file_path, 'rb'))
    
    return loaded_model

def make_predictions(loaded_model, df_rename):
    """
    Make predictions using the selected model.

    Args:
        model_defs (dict): A dictionary containing the loaded models.
        df_rename (pandas.DataFrame): The input data for making predictions.

    Returns:
        pandas.DataFrame: DataFrame with predicted labels added as a new column.
    """
    # Load the model and make predictions
    y_pred = loaded_model.predict(df_rename)
    
    # Add the predicted labels as a new column in the DataFrame
    df_rename["LGBM_Burn_Predicted"] = y_pred
    df_predicted = df_rename

    print('\033[1m'+"Prediction Initializing")

    # Display the count of each predicted label
    label_counts = Counter(y_pred)
    print("\nCount of each predicted label: ")
    for label, count in label_counts.items():
        print(f"Label {label}: {count}")

    print("Predicted Dataframe: ")
    display(df_predicted)

    return df_predicted

def burn_query(df_predicted, lat, long, fire_date):
    """
    Given a DataFrame with predicted burn values, latitude, and longitude,
    return a DataFrame containing coordinates predicted as burn.

    Args:
        df_predicted (pd.DataFrame): DataFrame with predicted burn values.
        lat (pd.Series): Latitude data.
        long (pd.Series): Longitude data.

    Returns:
        pd.DataFrame: DataFrame with burn coordinates.
    """
    df_coordinate = pd.concat([df_predicted, lat, long], axis=1)
    cols = df_coordinate.columns.tolist()
    cols = cols[-2:] + cols[:-2]
    df_coordinate = df_coordinate[cols]
    result_burn_point = df_coordinate[df_coordinate[df_coordinate.columns[-1]] == 1][[df_coordinate.columns[0], df_coordinate.columns[1]]]

    # Add fire date column
    result_burn_point['FIRE_DATE'] = fire_date

    # Display predicted burn coordinates
    print('\033[1m'+"Display Coordinate that Predicted as Burn : ")
    display(result_burn_point)

    return result_burn_point

def save_coordinate_to_database(result_burn_point, connection_string, point_table_name):
    """
    Save the filtered DataFrame to a MySQL database.
    
    Parameters:
    result_burn_point (pd.DataFrame): DataFrame containing filtered data.
    connection_string (str): Database connection string.
    table_name (str, optional): Name of the table to save the data to. Default is 'BURNT_SCAR_POINT'.
    
    Returns:
    None
    """
    # Create a connection to the MySQL database
    engine = create_engine(connection_string)
    
    # Save the DataFrame to the database
    result_burn_point.to_sql(point_table_name, con=engine, if_exists='append', index=False)
    
def find_best_n_clusters(result_burn_point, start=2, random_state=42):
    """
    Finds the best number of clusters based on the silhouette score.

    Parameters:
      - result_burn: array-like, shape (n_samples, n_features)
        The data to fit.
      - start: int, optional, default: 2
        The starting number of clusters to consider.
      - random_state: int, optional, default: 42
        The seed used by the random number generator.

    Returns:
      - best_n_clusters: int
        The number of clusters with the highest silhouette score.
      - best_score: float
        The highest silhouette score.
      - silhouette_list: list of float
        Silhouette scores for each number of clusters in the range.
    """

    result_burn_point = result_burn_point.drop(columns=['FIRE_DATE', 'COUNTRY', 'ISO3'])
    
    if len(result_burn_point) < start:
        print('\033[1m'+"Number of data points must be greater than cluster start.")
        raise ValueError("Number of data points must be greater than start")

    end = min(len(result_burn_point) // 2, 51)  # Consider at most half the data points, with a maximum of 50 clusters
    if len(result_burn_point) // 2 < end:
        end = len(result_burn_point) // 2

    range_n_clusters = range(start, end)
    silhouette_list = []
    best_score = -1
    best_n_clusters = None

    for n_clusters in range_n_clusters:
        clustering = KMeans(n_clusters=n_clusters, random_state=random_state, n_init='auto')
        clustering.fit(result_burn_point)
        cluster_labels = clustering.predict(result_burn_point)
        silhouette_avg = silhouette_score(result_burn_point, cluster_labels)
        silhouette_list.append(silhouette_avg)

        if silhouette_avg > best_score:
            best_score = silhouette_avg
            best_n_clusters = n_clusters

        print(f"For Number of Clusters: {n_clusters}, Average Silhouette Score is {silhouette_avg}")

    # Display results (assuming you have the necessary libraries for visualization)
    print('\033[1m'+"The number of clusters with the highest silhouette score is {best_n_clusters} with a silhouette score of {best_score}")
    print()  # This prints a blank line
    
    print('\033[1m'+"Result Graph for Silhouette Score for each Number of Clusters.")
    plt.figure(figsize=(10, 6))
    plt.plot(range(start, end), silhouette_list, '-o')
    plt.xlabel('Number of Clusters')
    plt.ylabel('Silhouette Score')
    plt.title('Silhouette Score for each Number of Clusters')
    plt.xticks(range(start, end, 2), fontsize=8, rotation=45)
    plt.show()

    return best_n_clusters, best_score, silhouette_list

def find_best_eps(result_burn_point, eps_range=None, min_samples=10):
    """
    Finds the best epsilon value for DBSCAN clustering based on the silhouette score.

    Parameters:
    - result_burn: array-like, shape (n_samples, n_features)
      The data to fit.
    - eps_range: list of float, optional
      The range of epsilon values to consider. If None, a default range is used.
    - min_samples: int, optional, default: 10
      The number of samples in a neighborhood for a point to be considered as a core point.

    Returns:
    - best_eps: float
      The epsilon value with the highest silhouette score.
    - best_score: float
      The highest silhouette score.
    - silhouette_scores: list of float
      Silhouette scores for each epsilon value in the range.
    """

    result_burn_point = result_burn_point.drop(columns=['FIRE_DATE', 'COUNTRY', 'ISO3'])

    if eps_range is None:
        eps_range = [0.001, 0.002, 0.003, 0.004, 0.005, 0.006, 0.007, 0.008, 0.009]

    best_score = -1
    best_eps = None
    silhouette_scores = []

    for eps in eps_range:
        print(f"eps value is {eps}")
        db = DBSCAN(eps=eps, min_samples=min_samples).fit(result_burn_point)
        labels = db.labels_
        print(set(labels))

        if len(set(labels)) > 1:  # Ensure that there is more than one cluster
            silhouette_avg = silhouette_score(result_burn_point, labels)
            print(f"For eps value={eps}, labels={labels}, the average silhouette score is {silhouette_avg}")
        else:
            silhouette_avg = -1
            print(f"For eps value={eps}, only one cluster found. Silhouette score is not applicable.")

        silhouette_scores.append(silhouette_avg)

        if silhouette_avg > best_score:
            best_score = silhouette_avg
            best_eps = eps
    
    print() # Add Blank Line
    print(f'\033[1m'+"The epsilon value with the highest silhouette score is {best_eps} with a silhouette score of {best_score}")
    print() # Add Blank Line
    
    print('\033[1m'+"Graph of silhouette score each Epsilon value: ")
    plt.figure(figsize=(10, 6))
    plt.plot(eps_range, silhouette_scores, '-o')
    plt.xlabel('Epsilon Value')
    plt.ylabel('Silhouette Score')
    plt.title('Silhouette Score for each Epsilon Value')
    plt.xticks(eps_range, fontsize=8, rotation=45)
    plt.show()

    return best_eps, best_score, silhouette_scores

def find_best_min_samples(result_burn_point, best_eps, best_n_clusters, min_samples_range=None):
    """
    Finds the best min_samples value for DBSCAN clustering to match the number of clusters from KMeans.

    Parameters:
    - result_burn: array-like, shape (n_samples, n_features)
      The data to fit.
    - best_eps: float
      The epsilon value to use for DBSCAN.
    - best_n_clusters: int
      The best number of clusters found from KMeans.
    - min_samples_range: range or list of int, optional
      The range of min_samples values to consider. If None, a default range is used.

    Returns:
    - best_min_samples: int
      The min_samples value that gives the same number of clusters as the best number of clusters from KMeans.
    - num_clusters_list: list of int
      Number of clusters for each min_samples value in the range.
    """
    result_burn_point = result_burn_point.drop(columns=['FIRE_DATE', 'COUNTRY', 'ISO3'])

    # Check the length of result_burn
    if len(result_burn_point) < 2:
        return "Error: result_burn must contain at least 2 samples."
    elif len(result_burn_point) >= 2 and len(result_burn_point) < 50:
        min_samples_range = range(2, int(len(result_burn_point) / 2) + 1)

    # Set default min_samples_range if not provided
    if min_samples_range is None:
        min_samples_range = range(2, 51)

    best_min_samples = None
    num_clusters_list = []

    for min_samples in min_samples_range:
        print(f"min_samples value is {min_samples}")
        db = DBSCAN(eps=best_eps, min_samples=min_samples).fit(result_burn_point)

        labels = set([label for label in db.labels_ if label >= 0])
        num_clusters = len(labels)
        print(f"For min_samples value={min_samples}, Total no. of clusters are {num_clusters}")

        num_clusters_list.append(num_clusters)

        if num_clusters == best_n_clusters:
            best_min_samples = min_samples

    # After the loop, prints the min_samples value that gives the same number of clusters as the best number of clusters from the KMeans algorithm.
    print('\033[1m'+"Display Minimum Samples Result based on number of clusters as the best number of clusters from the KMeans algorithm.")
    print() # Add Blank Line
    print(f'\033[1m'+"The min_samples value with the same number of clusters as the best number of clusters from the KMeans algorithm is {best_min_samples}.")
    print() # Add Blank Line
    
    print('\033[1m'+"Graph of Number of Clusters for each Min Samples Value.")
    plt.figure(figsize=(10, 6))
    plt.plot(min_samples_range, num_clusters_list, '-o')
    plt.xlabel('Min Samples')
    plt.ylabel('Number of Clusters')
    plt.title('Number of Clusters for each Min Samples Value')
    plt.xticks(min_samples_range, fontsize=8, rotation=45)
    plt.show()

    return best_min_samples, num_clusters_list

def perform_dbscan(result_burn_point, best_eps=None, best_min_samples=None):
    """
    Perform DBSCAN clustering on the given data and plot the clusters.

    Parameters:
    - result_burn: DataFrame containing the data to be clustered
    - best_eps: The best value for the epsilon parameter (optional)
    - best_min_samples: The best value for the min_samples parameter (optional)

    Returns:
    - None
    """

    result_burn_point = result_burn_point.drop(columns=['FIRE_DATE', 'COUNTRY', 'ISO3'])

    try:
        eps = best_eps if best_eps is not None else 0.1
        min_samples = best_min_samples if best_min_samples is not None else 5 # Default min_saple for DBSCAN from Scikitlearn
    except NameError:
        eps = 0.1
        min_samples = 5 # Default min_saple for DBSCAN from Scikitlearn

    # Perform DBSCAN on the data
    db = DBSCAN(eps=eps, min_samples=min_samples).fit(result_burn_point)

    # Create a new column in df for the cluster labels
    result_burn_point['Cluster'] = db.labels_

    # Create New Variable Instead
    result_burn_scar = result_burn_point

    # Print the number of clusters
    print('\033[1m'+"Number of Clusters that Clusterd from DBSCAN.")
    print() # Add Blank Line
    print('\033[1m'+"Number of Clusters will be display order by number of elements that clustered for each cluster.")
    print() # Add Blank Line
    print('\033[1m'+"What elements that not clustered of any cluster is -1.")
    print() # Add Blank Line
    num_clusters = len(np.unique(db.labels_))
    print(f"Number of clusters: {num_clusters}")
    print(result_burn_scar['Cluster'].value_counts())

    # Plot the clusters
    print('\033[1m'+"Clustering Result Plot.")
    plt.figure(figsize=(10, 10))
    plt.scatter(result_burn_scar['LONGITUDE'], result_burn_scar['LATITUDE'], c=db.labels_, cmap='viridis')
    plt.colorbar()

    plt.title('DBSCAN Clustering of Burn Area Geographic Data')
    plt.xlabel('Longitude')
    plt.ylabel('Latitude')
    plt.show()
    
    return result_burn_scar

def create_clusters_gdf(result_burn_scar, db_labels_column='Cluster'):
    """
    Create a GeoDataFrame with convex hull polygons for each cluster.

    Parameters:
    - result_burn: DataFrame containing the data
    - db_labels_column: Name of the column with cluster labels (default: 'Cluster')

    Returns:
    - gdf: GeoDataFrame with cluster polygons
    """
    clusters = [result_burn_scar[result_burn_scar[db_labels_column] == label] for label in np.unique(result_burn_scar[db_labels_column]) if label != -1]
    polygons = [MultiPoint(cluster[['LONGITUDE', 'LATITUDE']].values).convex_hull for cluster in clusters]
    result_gdf = gpd.GeoDataFrame({'geometry': polygons})
    
    # Set the CRS explicitly
    result_gdf.crs = 'EPSG:4326'
    
    # Calculate centroids
    result_gdf['centroid'] = result_gdf['geometry'].centroid
    
    # Delete rows where the geometry is empty or contains a POINT or is a GEOMETRYCOLLECTION EMPTY
    result_gdf = result_gdf[~result_gdf['geometry'].is_empty]
    result_gdf = result_gdf[result_gdf['geometry'].geom_type != 'Point']
    result_gdf = result_gdf[result_gdf['geometry'].apply(lambda geom: geom.geom_type != 'GeometryCollection' or not geom.is_empty)]
    
    return result_gdf
          
def calculate_area(result_gdf):
    
    # Calculate the area of the polygons
    ## Create a new GeoDataFrame with the geometry
    area_gdf = gpd.GeoDataFrame(geometry=result_gdf['geometry'])
    
    ## Reproject area_gdf to a suitable projected CRS for accurate area calculations
    area_gdf = area_gdf.to_crs(epsg=32648)  # Replace with the desired EPSG code
    
    ## Calculate the area in square meters
    area_gdf['AREA'] = area_gdf['geometry'].area
    
    # Concatenate the area information with the original GeoDataFrame
    result_gdf = gpd.GeoDataFrame(pd.concat([result_gdf, area_gdf['AREA']], axis=1))

    # Display GeoDataFrame
    display(result_gdf)
          
    # Plot Polygon      
    fig, ax = plt.subplots(1, 1)
    result_gdf.plot(ax=ax, color='red', edgecolor='red')

    # Plot the centroids
    result_gdf['centroid'].plot(ax=ax, color='black', marker='o', markersize=5)
    plt.xlabel('Longitude')
    plt.ylabel('Latitude')
    plt.show()
    
    return result_gdf

def extract_coordinates(geom):
    """Extracts a list of coordinates from a geometric object.

    Args:
        geom: A Shapely geometric object (Point, LineString, Polygon, MultiPolygon,
              or GeometryCollection).

    Returns:
        A list of coordinates, where each coordinate is a tuple of (x, y) values.
        Returns None if the geometry type is not supported or is a Point.
    """
    
    if geom is None:
        return None  # Handle cases where geom might be None

    if geom.geom_type == 'Point':
        print("Don't support point for Making Polygon.")  # Print message for Point geometry
        return None

    elif geom.geom_type == 'LineString':
        return list(geom.coords)  # Extract coordinates for LineString geometry

    elif geom.geom_type == 'Polygon':
        # Extract coordinates for the exterior ring of the Polygon
        return list(geom.exterior.coords)

    elif geom.geom_type == 'MultiPolygon':
        # Extract coordinates for each Polygon in the MultiPolygon
        return [list(p.exterior.coords) for p in geom]

    elif geom.geom_type == 'GeometryCollection':
        coordinates = []
        for g in geom:
            extracted_coords = extract_coordinates(g)  # Recursive call for nested geometries
            if extracted_coords:
                coordinates.extend(extracted_coords)
        return coordinates

    else:
        return None  # Handle unsupported geometry types

def get_country_name(country_code):
    try:
        return pycountry.countries.get(alpha_2=country_code).name
    except AttributeError:
        return None

def extract_location_info(results):
    locations, cities, provinces, countries = [], [], [], []
    for res in results:
        location = f"{res['name']}, {res['admin1'] if 'admin1' in res else ''}, {get_country_name(res['cc'])}"
        city, province, country = location.split(', ')
        locations.append(location)
        cities.append(city)
        provinces.append(province)
        countries.append(country)
    return locations, cities, provinces, countries

def reverse_geocode_point(result_burn_point):
    coordinates = list(zip(result_burn_point['LATITUDE'], result_burn_point['LONGITUDE']))
    results = rg.search(coordinates)

    locations, cities, provinces, countries = extract_location_info(results)
    
    # Define the list of allowed countries for Reverse Geocode.
    allowed_countries = ['Thailand', "Lao People's Democratic Republic", 'Myanmar', 'Viet Nam', 'Lao']
    result_burn_point['COUNTRY'] = countries
    
    # Create a dictionary mapping country names to ISO3 codes using pycountry
    country_to_iso3 = {country.name: country.alpha_3 for country in pycountry.countries}
    
    result_burn_point['ISO3'] = result_burn_point['COUNTRY'].map(country_to_iso3)
    result_burn_point.loc[~result_burn_point['COUNTRY'].isin(allowed_countries), ['COUNTRY', 'ISO3']] = 'NULL'
    
    result_burn_point = result_burn_point[['FIRE_DATE', 'LATITUDE', 'LONGITUDE', 'COUNTRY', 'ISO3']]

    print('\033[1m'+"Burn Coordinate that performed Reverse Geocode: ")
    display(result_burn_point)

    return result_burn_point

def reverse_geocode(result_gdf, fire_date):
    result_gdf['LATITUDE'] = result_gdf['centroid'].y
    result_gdf['LONGITUDE'] = result_gdf['centroid'].x
    result_gdf['GEOMETRY_DATA'] = result_gdf['geometry'].apply(extract_coordinates).astype(str)
    result_gdf['GEOMETRY_TYPE'] = result_gdf['geometry'].geom_type

    coordinates = list(zip(result_gdf['LATITUDE'], result_gdf['LONGITUDE']))
    results = rg.search(coordinates)

    locations, cities, provinces, countries = extract_location_info(results)
    
    # Define the list of allowed countries for Reverse Geocode.
    allowed_countries = ['Thailand', "Lao People's Democratic Republic", 'Myanmar', 'Viet Nam', 'Lao']
    result_gdf['location'], result_gdf['AP_EN'], result_gdf['PV_EN'], result_gdf['COUNTRY'] = locations, cities, provinces, countries
    
    # Create a dictionary mapping country names to ISO3 codes using pycountry
    country_to_iso3 = {country.name: country.alpha_3 for country in pycountry.countries}
    
    result_gdf['ISO3'] = result_gdf['COUNTRY'].map(country_to_iso3)
    result_gdf.loc[~result_gdf['COUNTRY'].isin(allowed_countries), ['COUNTRY', 'AP_EN', 'PV_EN', 'ISO3']] = 'NULL'

    result_gdf['FIRE_DATE'] = fire_date # Add Fire Date
    
    result_gdf = result_gdf[['FIRE_DATE', 'AP_EN', 'PV_EN', 'COUNTRY', 'LATITUDE', 'LONGITUDE', 'GEOMETRY_DATA', 'GEOMETRY_TYPE', 'AREA', 'ISO3']]

    display(result_gdf)
    return result_gdf

def save_result_to_database(result_gdf, connection_string, scar_table_name):
    """
    Save the filtered DataFrame to a MySQL database.
    
    Parameters:
    result_burn (pd.DataFrame): DataFrame containing filtered data.
    connection_string (str): Database connection string.
    table_name (str, optional): Name of the table to save the data to. Default is 'BURNT_SCAR_POINT'.
    
    Returns:
    None
    """
    
    # Create a connection to the MySQL database
    engine = create_engine(connection_string)
    
    # Save the DataFrame to the database
    result_gdf.to_sql(scar_table_name, con=engine, if_exists='append', index=False)

def main():

    # Perform Prerpocessing
    data_path = (r"D:\Work\Code งาน\Lab-docker\RIDA\RIDA_CSV\Predict\04-06-2024\T47QNB_20240304T034641.csv") # Directory to Dataframe
    df = pd.read_csv(data_path) # Read CSV in specify directory
    scaler_path = (r'D:\Work\Code งาน\Lab-docker\RIDA\Export Model\04-06-2024\min_max_scaler.pkl') # Directory to Mormalization Pickle File
    df_rename, lat, long, fire_date = preprocess(df, scaler_path) # Call Preprocessing Function

    # Load Model
    directory = (r'D:\Work\Code งาน\Lab-docker\RIDA\Export Model\04-06-2024') # Directory to Machine Learning Model Pickle File
    loaded_model = load_models(directory) # Call Funtion to Load Model from Directory that specified

    # Perform Prediction
    df_predicted = make_predictions(loaded_model, df_rename)
    
    # Query only Row Predicted as Burn
    result_burn_point = burn_query(df_predicted, lat, long, fire_date)

    # Reverse Geocode for Burn Point
    reverse_geocode_point(result_burn_point)

    # Perform Clustering
    best_n_clusters, best_score, silhouette_list = find_best_n_clusters(result_burn_point, start=2, random_state=42) # Find Best number of cluster
    best_eps, best_score, silhouette_scores = find_best_eps(result_burn_point, eps_range=None, min_samples=10) # Find Best Epsilon
    best_min_samples, num_clusters_list = find_best_min_samples(result_burn_point, best_eps, best_n_clusters, min_samples_range=None) # Find Best Minimum Sample
    result_burn_scar = perform_dbscan(result_burn_point, best_eps=best_eps, best_min_samples=best_min_samples)


    # Concat burn result with Fire Date
    result_burn_scar = pd.concat([result_burn_scar, fire_date], axis=0)

    # Call the function to create the GeoDataFrame
    print("Polygons Clustered Plotting and GeoDataFrame include Geometry, Centroid of Each Polygons and Area in Square Meters.")
    result_gdf = create_clusters_gdf(result_burn_scar)

    # Calculate Area of Polygon
    result_gdf = calculate_area(result_gdf)

    # Reverse Geocode for Burn Scar Polygon
    print("Completely GeoDataFrame which have been reverse Geocoded. Contain District, Province, Country and Fire Date have been additional.")
    result_gdf = reverse_geocode(result_gdf, fire_date)

    # Export Burn Coordinate to Database
    connection_string = 'mysql+pymysql://root:gdkll,%40MFU2024@10.1.29.33:3306/RidaDB' # Connection to Dabase Engine
    point_table_name = 'BURNT_SCAR_POINT'
    save_coordinate_to_database(result_burn_point, connection_string, point_table_name)

    # Export Burn Scar to Database
    scar_table_name = 'BURNT_SCAR_INFO'
    save_result_to_database(result_gdf, connection_string, scar_table_name)

# For running in a script mode
if __name__ == "__main__":
    main()