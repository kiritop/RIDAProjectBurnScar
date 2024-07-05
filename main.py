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

from image_processing import data_preparation
from predict_module import predict_main

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


    predict_main()


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


    # Ensure these paths are correct and necessary
    raster_path = 'raster'
    if os.path.exists(raster_path):
        shutil.rmtree(raster_path)
    os.makedirs(raster_path)

    satellite_image_path = 'satellite_image'
    if os.path.exists(satellite_image_path):
        shutil.rmtree(satellite_image_path)
    os.makedirs(satellite_image_path)

    print("Done.")

if __name__ == "__main__":
    main()
