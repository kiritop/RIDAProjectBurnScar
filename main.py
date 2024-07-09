import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
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
from sklearn.metrics import silhouette_score
from sklearn.cluster import KMeans, DBSCAN
import logging
import shutil
import re
import rasterio

from image_processing import data_preparation
from predict_module import predict_main
from create_polygon import create_polygon

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()

def find_folders(base_dir):
    found_folders = []
    pattern = re.compile(r'^[A-Z0-9]{6}_\d{8}$')
    logger.info(f"Searching in base directory: {base_dir}")

    # List contents of base_dir
    logger.info(f"Contents of {base_dir}:")
    for item in os.listdir(base_dir):
        logger.info(f"  {item}")

    for item in os.listdir(base_dir):
        full_path = os.path.join(base_dir, item)
        if os.path.isdir(full_path):
            logger.info(f"Checking directory: {full_path}")
            if pattern.match(item):
                logger.info(f"Matched directory: {full_path}")
                found_folders.append(full_path)
            else:
                logger.info(f"Directory does not match pattern: {full_path}")

    return found_folders

def find_tif_file(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tif'):
                return os.path.join(root, file)
    return None

def main():

    base_dir = 'satellite_image'
    folder_paths = find_folders(base_dir)
    if not folder_paths:
        logger.warning(f"No folders found in {base_dir} matching the pattern TILECODE_DATE.")
        return

    output_folder_after = "sentinel_process/Image"  # Ensure the correct absolute path

    data_preparation(folder_paths, output_folder_after)
    print("Finish process prepared data.")
    print("Next stage to predict process.")

    

    try:
        shutil.rmtree('prepare_image')
        print(f"Removed directory: prepare_image")
    except FileNotFoundError:
        pass  # Skip if the directory does not exist

    try:
        shutil.rmtree('rename_image')
        print(f"Removed directory: rename_image")
    except FileNotFoundError:
        pass

    shutil.rmtree('sentinel_process')
    os.makedirs('sentinel_process')
    os.makedirs('sentinel_process/Image')
    print(f"Created directory: sentinel_process/Image")
    os.makedirs('sentinel_process/Raster_Burncon')
    print(f"Created directory: sentinel_process/Raster_Burncon")
    os.makedirs('sentinel_process/Raster_burnshape')

    predict_main()
    print("Predict Done.")
    
    input_raster_path = find_tif_file('raster_output')
    if not input_raster_path:
        logger.error("No .tif file found in the specified directory.")
        return
    
    output_shapefile_path = r'polygon/burn_condition.shp'
    
    total_polygons, shown_polygons, total_area = create_polygon(input_raster_path, output_shapefile_path)
    
    print(f"Total number of polygons: {total_polygons}")
    print(f"Number of polygons shown: {shown_polygons}")
    print(f"Total burn area: {total_area:.2f} square meters")

    print("Done.")

if __name__ == "__main__":
    main()
