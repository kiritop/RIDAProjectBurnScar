import os
import pandas as pd
from Server_Module import (
    preprocess, load_models, make_predictions, burn_query, reverse_geocode_point,
    find_best_n_clusters, find_best_eps, find_best_min_samples, perform_dbscan,
    create_clusters_gdf, calculate_area, reverse_geocode, save_coordinate_to_database,
    save_result_to_database
)

def find_csv_files(directory):
    """Recursively find and return the paths of all CSV files in a directory."""
    csv_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.csv'):
                csv_files.append(os.path.join(root, file))
    return csv_files

def main():
    # Define the base directory containing nested CSV files
    base_dir = r"RIDA/Dataframe"

    # Find all CSV files in the nested directory structure
    csv_files = find_csv_files(base_dir)

    # Loop through each CSV file
    for csv_file in csv_files:
        # Perform Preprocessing
        df = pd.read_csv(csv_file)  # Read CSV in specified directory
        scaler_path = r'RIDA/Export Model/min_max_scaler.pkl'  # Directory to Normalization Pickle File
        df_rename, lat, long, fire_date = preprocess(df, scaler_path)  # Call Preprocessing Function

        # Load Model
        directory = r'RIDA/Export Model'  # Directory to Machine Learning Model Pickle File
        loaded_model = load_models(directory)  # Call Function to Load Model from Directory that specified

        # Perform Prediction
        df_predicted = make_predictions(loaded_model, df_rename)
    
        # Query only Rows Predicted as Burn
        result_burn_point = burn_query(df_predicted, lat, long, fire_date)

        # Reverse Geocode for Burn Point
        reverse_geocode_point(result_burn_point)

        # Perform Clustering
        best_n_clusters, best_score, silhouette_list = find_best_n_clusters(result_burn_point, start=2, random_state=42)  # Find Best Number of Clusters
        best_eps, best_score, silhouette_scores = find_best_eps(result_burn_point, eps_range=None, min_samples=10)  # Find Best Epsilon
        best_min_samples, num_clusters_list = find_best_min_samples(result_burn_point, best_eps, best_n_clusters, min_samples_range=None)  # Find Best Minimum Sample
        result_burn_scar = perform_dbscan(result_burn_point, best_eps=best_eps, best_min_samples=best_min_samples)

        # Concat burn result with Fire Date
        result_burn_scar = pd.concat([result_burn_scar, fire_date], axis=0)

        # Call the function to create the GeoDataFrame
        print("Polygons Clustered Plotting and GeoDataFrame include Geometry, Centroid of Each Polygons and Area in Square Meters.")
        result_gdf = create_clusters_gdf(result_burn_scar)

        # Calculate Area of Polygon
        result_gdf = calculate_area(result_gdf)

        # Reverse Geocode for Burn Scar Polygon
        print("Completely GeoDataFrame which have been reverse Geocoded. Contain District, Province, Country and Fire Date have been added.")
        result_gdf = reverse_geocode(result_gdf, fire_date)

        # Export Burn Coordinate to Database
        connection_string = 'mysql+pymysql://root:gdkll,%40MFU2024@10.1.29.33:3306/RidaDB'  # Connection to Database Engine
        point_table_name = 'BURNT_SCAR_POINT'
        save_coordinate_to_database(result_burn_point, connection_string, point_table_name)

        # Export Burn Scar to Database
        scar_table_name = 'BURNT_SCAR_INFO'
        save_result_to_database(result_gdf, connection_string, scar_table_name)

# For running in script mode
if __name__ == "__main__":
    main()
