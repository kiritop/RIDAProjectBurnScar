import rasterio as rio
import numpy as np
import pandas as pd
import pickle
from collections import Counter
import os
import geopandas as gpd
from shapely.geometry import shape
from rasterio.features import shapes
from scipy.ndimage import label
import reverse_geocoder as rg
import pycountry
from datetime import datetime
from sklearn.preprocessing import MinMaxScaler
import logging
import ast
from shapely.geometry import Polygon

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Convert string representations of lists to actual lists and then to Shapely geometries
def parse_geometry(geometry_data):
    try:
        # Convert the string representation of the list to an actual list
        coordinates = ast.literal_eval(geometry_data)
        return Polygon(coordinates)
    except (ValueError, SyntaxError):
        return None

def get_country_name(country_code):
    try:
        return pycountry.countries.get(alpha_2=country_code).name
    except AttributeError:
        return None

def reverse_geocode(gdf):
    coordinates = list(zip(gdf['LATITUDE'], gdf['LONGITUDE']))
    results = rg.search(coordinates)

    locations, cities, provinces, countries = [], [], [], []
    for res in results:
        country = get_country_name(res['cc'])
        location = f"{res['name']}, {res['admin1']}, {country}"
        locations.append(location)
        cities.append(res['name'])
        provinces.append(res['admin1'])
        countries.append(country)
    
    allowed_countries = ['Thailand', "Lao People's Democratic Republic", 'Myanmar', 'Viet Nam', 'Lao']
    gdf['location'] = locations
    gdf['AP_EN'] = cities
    gdf['PV_EN'] = provinces
    gdf['COUNTRY'] = countries
    
    country_to_iso3 = {country.name: country.alpha_3 for country in pycountry.countries}
    
    gdf['ISO3'] = gdf['COUNTRY'].map(country_to_iso3)
    gdf.loc[~gdf['COUNTRY'].isin(allowed_countries), ['COUNTRY', 'AP_EN', 'PV_EN', 'ISO3']] = 'NULL'

    # Filter out rows with 'NULL' in any of the specified columns
    gdf = gdf.loc[~(gdf[['COUNTRY', 'AP_EN', 'PV_EN', 'ISO3']] == 'NULL').any(axis=1)]
    
    return gdf

def preprocess(df, scaler_path):
    expected_column_names = [
        'Band_3_Post', 'Band_4_Post', 'Band_5_Post', 'Band_6_Post',
        'Band_7_Post', 'Band_8_Post', 'Band_8A_Post', 'Band_9_Post', 'Band_12_Post'
    ]
    
    with open(scaler_path, 'rb') as f:
        scaler = pickle.load(f)
    
    scaler_features = scaler.feature_names_in_
    
    rename_dict = {f"band_{i+1}": name for i, name in enumerate(expected_column_names)}
    
    df_rename = df.rename(columns=rename_dict)
    
    df_for_scaling = df_rename[scaler_features]
    
    df_normalized = scaler.transform(df_for_scaling)
    df_normalized = pd.DataFrame(df_normalized, columns=scaler_features)
    
    for col in df_rename.columns:
        if col not in df_normalized.columns:
            df_normalized[col] = df_rename[col]
    
    return df_normalized

def make_predictions(directory, df_rename):
    file_path = os.path.join(directory)
    loaded_model = pickle.load(open(file_path, 'rb'))
    y_pred = loaded_model.predict(df_rename)
    
    df_rename["BURN_PREDICTED"] = y_pred
    df_predicted = df_rename
    
    label_counts = Counter(y_pred)
    print("\nCount of each predicted label:")
    for label, count in label_counts.items():
        print(f"Label {label}: {count}")
    return df_predicted

def get_utm_zone(tif_file):
    filename = os.path.basename(tif_file)
    if 'T47' in filename:
        return 'EPSG:32647'
    elif 'T48' in filename:
        return 'EPSG:32648'
    else:
        with rio.open(tif_file) as src:
            crs = src.crs
            if crs.is_projected:
                utm_zone = crs.to_epsg()
                return f'EPSG:{utm_zone}'
    
    return 'EPSG:32648'

def process_predictions(predictions, original_tif_path, fire_date=None):
    if fire_date is None:
        filename = os.path.basename(original_tif_path)
        fire_date = filename.split('_')[1][:8]
        fire_date = datetime.strptime(fire_date, '%Y%m%d').strftime('%Y-%m-%d')

    with rio.open(original_tif_path) as src:
        transform = src.transform
        crs = src.crs
        height, width = src.shape

    raster_data = predictions.reshape((height, width))

    burn_condition = (raster_data == 1).astype(np.uint8)
    labeled_array, num_features = label(burn_condition)
    shapes_generator = shapes(labeled_array, transform=transform)

    polygons = []
    for geom, value in shapes_generator:
        if value > 0:
            polygons.append(shape(geom))

    gdf = gpd.GeoDataFrame(geometry=polygons, crs=crs)
    gdf = gdf.to_crs("EPSG:4326")
    
    utm_zone = get_utm_zone(original_tif_path)
    gdf['AREA'] = gdf.to_crs(utm_zone).area
    
    gdf['LATITUDE'] = gdf.geometry.centroid.y
    gdf['LONGITUDE'] = gdf.geometry.centroid.x
    gdf['GEOMETRY_DATA'] = gdf['geometry'].apply(lambda geom: str(list(geom.exterior.coords)))
    gdf['GEOMETRY_TYPE'] = gdf['geometry'].geom_type
    gdf['FIRE_DATE'] = fire_date

    gdf = reverse_geocode(gdf)
    result_df = gdf[['AP_EN', 'PV_EN', 'COUNTRY', 'LATITUDE', 'LONGITUDE', 'GEOMETRY_DATA', 'GEOMETRY_TYPE', 'AREA', 'ISO3', 'FIRE_DATE']]

    print(result_df)

    return result_df

def preprocess_chunk(chunk, scaler):
    expected_column_names = [
        'Band_3_Post', 'Band_4_Post', 'Band_5_Post', 'Band_6_Post',
        'Band_7_Post', 'Band_8_Post', 'Band_8A_Post', 'Band_9_Post', 'Band_12_Post'
    ]
    
    rename_dict = {f"band_{i+1}": name for i, name in enumerate(expected_column_names)}
    
    chunk_rename = chunk.rename(columns=rename_dict)
    
    scaler_features = scaler.feature_names_in_
    chunk_for_scaling = chunk_rename[scaler_features]
    
    chunk_normalized = scaler.transform(chunk_for_scaling)
    chunk_normalized = pd.DataFrame(chunk_normalized, columns=scaler_features)
    
    return chunk_normalized

def make_predictions_chunk(model, chunk):
    y_pred = model.predict(chunk)
    return y_pred

def find_tif_files(directory):
    tif_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tif') or file.endswith('.tiff'):
                if 'T47' in file or 'T48' in file:
                    tif_files.append(os.path.abspath(os.path.join(root, file)))
    return tif_files

def predict_main():
    base_dir = r"raster"
    tif_files = find_tif_files(base_dir)
    
    try:
        for tif_file in tif_files:
            try:
                with rio.open(tif_file) as src:
                    print(f"\nProcessing file: {tif_file}")
                    print("\nMetadata:")
                    for key, value in src.meta.items():
                        print(f"{key}: {value}")
                    
                    print("\nAdditional Metadata:")
                    print(f"Bounds: {src.bounds}")
                    print(f"CRS: {src.crs}")
                    print(f"Transform: {src.transform}")
                    
                    height, width = src.shape
                    n_bands = src.count
                    
                    print(f"Image dimensions: {width}x{height}")
                    print(f"Number of bands: {n_bands}")
                    
                    scaler_path = r"model/min_max_scaler.pkl"
                    with open(scaler_path, 'rb') as f:
                        scaler = pickle.load(f)
                    
                    model_path = r"model/Model_LGBM.sav"
                    with open(model_path, 'rb') as f:
                        model = pickle.load(f)
                    
                    chunk_size = 1000000
                    predictions = np.zeros((height, width), dtype=np.uint8)
                    
                    for row in range(0, height, chunk_size // width):
                        row_end = min(row + chunk_size // width, height)
                        chunk = src.read(window=((row, row_end), (0, width)))
                        
                        chunk_df = pd.DataFrame(chunk.reshape([n_bands, -1]).T, columns=[f"band_{i+1}" for i in range(n_bands)])
                        
                        chunk_preprocessed = preprocess_chunk(chunk_df, scaler)
                        
                        chunk_predictions = make_predictions_chunk(model, chunk_preprocessed)
                        
                        predictions[row:row_end, :] = chunk_predictions.reshape((row_end - row, width))
                    
                    print("Predictions shape:", predictions.shape)
                    
                    result_df = process_predictions(predictions, tif_file)
                    
                    print(f"Processing completed for {tif_file}")

            except Exception as e:
                print(f"An error occurred while processing file {tif_file}: {e}")
                logger.error(f"An error occurred while processing file {tif_file}: {e}")
    finally:
        print("Sucess Prediction Process.")

if __name__ == "__main__":
    predict_main()