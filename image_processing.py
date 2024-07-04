import os
import shutil
import logging
from concurrent.futures import ThreadPoolExecutor
import subprocess
import rasterio
from rasterio.enums import Resampling
from rasterio.windows import Window
from shapely.geometry import box
import numpy as np

logger = logging.getLogger()

# FullyTile --------------------------------------------------------------------------------------------------------------------------------------------------------------------

def resample_raster(input_raster, output_raster, new_resolution):
    try:
        with rasterio.open(input_raster) as src:
            transform = src.transform
            data = src.read(
                out_shape=(
                    src.count,
                    int(src.height * src.transform.a / new_resolution),
                    int(src.width * src.transform.a / new_resolution)
                ),
                resampling=Resampling.nearest
            )
            transform = src.transform * src.transform.scale(
                (src.width / data.shape[-1]),
                (src.height / data.shape[-2])
            )
            profile = src.profile
            profile.update(transform=transform, width=data.shape[2], height=data.shape[1])

            with rasterio.open(output_raster, 'w', **profile) as dst:
                dst.write(data)
        logger.info(f"Resampled raster saved to {output_raster}")
    except Exception as e:
        logger.error(f"Failed to resample raster {input_raster}: {e}")

def parallel_resample(raster_pairs):
    with ThreadPoolExecutor() as executor:
        executor.map(lambda pair: resample_raster(pair[0], pair[1], pair[2]), raster_pairs)

def chop_and_save_tiles(cropped_raster, meta, tile_size, output_folder, original_filename):
    try:
        if meta['width'] <= tile_size and meta['height'] <= tile_size:
            logger.info(f"Image {original_filename} is smaller than the tile size; skipping chop.")
            area_folder_path = os.path.join(output_folder)
            if not os.path.exists(area_folder_path):
                os.makedirs(area_folder_path)

            tile_name = f"{original_filename}.jp2"
            tile_path = os.path.join(area_folder_path, tile_name)

            with rasterio.open(tile_path, "w", **meta) as tile_raster:
                tile_raster.write(cropped_raster.read())
            logger.info(f"Saved entire image {tile_name} to {area_folder_path}")
            return

        bounds = cropped_raster.bounds
        left, bottom, right, top = bounds

        tile_width = (meta['width'] + tile_size - 1) // tile_size
        tile_height = (meta['height'] + tile_size - 1) // tile_size

        for row in range(tile_height):
            for col in range(tile_width):
                window = Window(col * tile_size, row * tile_size, tile_size, tile_size)
                tile_data = cropped_raster.read(window=window)

                if tile_data.any():
                    x_min = left + col * tile_size * meta['transform'][0]
                    y_max = top + row * tile_size * meta['transform'][3]
                    x_max = x_min + tile_size * meta['transform'][0]
                    y_min = y_max + tile_size * meta['transform'][3]
                    tile_bounds = box(x_min, y_min, x_max, y_min)

                    area_folder = f"Area{row}{col}"
                    area_folder_path = os.path.join(output_folder, area_folder)
                    if not os.path.exists(area_folder_path):
                        os.makedirs(area_folder_path)

                    tile_name = f"{original_filename}.jp2"
                    tile_path = os.path.join(area_folder_path, tile_name)
                    tile_meta = meta.copy()
                    tile_meta.update({
                        "height": tile_size,
                        "width": tile_size,
                        "transform": rasterio.transform.from_bounds(*tile_bounds.bounds, tile_size, tile_size)
                    })

                    with rasterio.open(tile_path, "w", **tile_meta) as tile_raster:
                        tile_raster.write(tile_data)
                    logger.info(f"Saved tile {tile_name} to {area_folder_path}")
    except Exception as e:
        logger.error(f"Failed to save tiles for {original_filename}: {e}")

# def rename_file(original_name, folder_type):
#     parts = original_name.split('_')
#     if '20m' in original_name or '60m' in original_name:
#         if 'B12' in original_name and folder_type == 'Before':
#             new_name = f"{parts[0]}_B1210.jp2"
#         else:
#             parts[-2] = parts[-2].replace('20m', '10').replace('60m', '10')
#             new_name = f"{parts[0]}_{parts[1]}_{parts[2]}10.jp2"
#     elif folder_type == 'Before':
#         new_name = f"{parts[0]}_{parts[2]}.jp2"
#     else:  
#         new_name = f"{parts[0]}_{parts[1]}_{parts[2]}.jp2"  
#     return new_name


def rename_file(original_name, folder_type):
    parts = original_name.split('_')
    band = parts[2].split('.')[0]  # Remove the file extension if present
    
    if band not in ['B02', 'B03', 'B04', 'B08']:
        new_name = f"{parts[0]}_{parts[1]}_{band}10.jp2"
    else:
        new_name = original_name
    
    return new_name


def process_files_predict(folder_paths, output_folder_after):
    for folder_path in folder_paths:
        folder_name = os.path.basename(folder_path)

        if not os.path.isdir(folder_path):
            logger.error(f"Invalid folder path: {folder_path}")
            continue

        jp2_files = [f for f in os.listdir(folder_path) if f.endswith(".jp2")]

        prepare_dir = os.path.join('prepare_image', folder_name)
        rename_dir = os.path.join('rename_image', folder_name)

        # Create directories if they don't exist
        for directory in [prepare_dir, rename_dir]:
            if not os.path.exists(directory):
                os.makedirs(directory)

        # Copy all files to the prepare_image directory
        for filename in jp2_files:
            shutil.copy(os.path.join(folder_path, filename), os.path.join(prepare_dir, filename))

        logger.info(f"Files copied to prepare_image directory for {folder_name}.")

        resample_pairs = []

        for filename in jp2_files:
            if any(band in filename for band in ['B02', 'B03', 'B04', 'B08']):
                new_filename = rename_file(filename, folder_name)
                shutil.copy(os.path.join(prepare_dir, filename), os.path.join(rename_dir, new_filename))
            else:
                new_filename = rename_file(filename, folder_name)
                resample_pairs.append((os.path.join(prepare_dir, filename), os.path.join(rename_dir, new_filename), 10))

        parallel_resample(resample_pairs)

        all_files = [rename_file(f, folder_name) for f in jp2_files]
        all_files = [os.path.basename(f) for f in all_files]

        # Ensure unique filenames
        unique_files = {os.path.basename(f): f for f in all_files}.values()

        for filename in unique_files:
            try:
                with rasterio.open(os.path.join(rename_dir, filename)) as src:
                    meta = src.meta.copy()
                    original_filename = os.path.splitext(filename)[0]
                    max_tile_size = max(meta['width'], meta['height'])  # for develop who need to set comment this section
                    chop_and_save_tiles(src, meta, max_tile_size, os.path.join(output_folder_after, folder_name), original_filename)  # and change max_tile_size to any ex. 2048 , 1024, 256

            except Exception as e:
                logger.error(f"Failed to process file {filename}: {e}")

        logger.info(f"Processing completed for folder: {folder_name}")



def data_preparation(folder_paths, output_folder_after):
    if folder_paths:
        for folder_path in folder_paths:
            if os.path.isdir(folder_path):
                logger.info(f"Processing folder: {folder_path}")
                process_files_predict([folder_path], output_folder_after)
            else:
                logger.error(f"Invalid folder path: {folder_path}")

        logger.info("Processing completed for all folders.")

        # Define the path to the subprocess script
        script_path = "sentinel_process.py"

        # Run the script as a subprocess
        try:
            result = subprocess.run(["python", script_path], capture_output=True, text=True, check=True)
            logger.info("Subprocess output:\n" + result.stdout)
        except subprocess.CalledProcessError as e:
            logger.error("Error during subprocess execution:\n" + e.stderr)

        # Move processed folders to the result folder
        
        src_folder = "sentinel_process/Raster_Burncon"
        dest_base_folder = "raster"

        if not os.path.exists(dest_base_folder):
            os.makedirs(dest_base_folder)

        for area_dir in os.listdir(src_folder):
            area_path = os.path.join(src_folder, area_dir)
            if os.path.isdir(area_path):
                folder_counter = 0  # Initialize a counter for folders
                for file_name in os.listdir(area_path):
                    if file_name.endswith('.tif'):
                        parts = file_name.split('_')
                        tile_name = parts[0]
                        date = parts[1][:8]  # Use full date (YYYYMMDD)
                        year = date[:4]
                        month = date[4:6]

                        pipeline_type = "" 

                        # Create a unique folder name by appending a counter
                        dest_folder_base = os.path.join(dest_base_folder, pipeline_type, tile_name, year, month, f"{tile_name}_{date}")
                        dest_folder = dest_folder_base

                        while os.path.exists(dest_folder):
                            folder_counter += 1
                            dest_folder = f"{dest_folder_base}_{folder_counter}"

                        if not os.path.exists(dest_folder):
                            os.makedirs(dest_folder)
                            logger.info(f"Created directory: {dest_folder}")

                        # Move all files from the area directory
                        for area_file in os.listdir(area_path):
                            src_file = os.path.join(area_path, area_file)
                            dest_file = os.path.join(dest_folder, area_file)  # Keep the original file name
                            shutil.move(src_file, dest_file)  # Use shutil.move to move the file
                            logger.info(f"Moved {src_file} to {dest_file}")
                        break  # Only need one .tif file to determine the structure

        logger.info("Files moved to result folder successfully.")

    else:
        logger.error("No folder paths provided")

# def server_predict(folder_paths, output_folder_after):
#     if folder_paths:
#         for folder_path in folder_paths:
#             if os.path.isdir(folder_path):
#                 logger.info(f"Processing folder: {folder_path}")
#                 process_files_predict([folder_path], output_folder_after)
#             else:
#                 logger.error(f"Invalid folder path: {folder_path}")

#         logger.info("Processing completed for all folders.")

#         # Define the path to the subprocess script
#         script_path = "Sentinel_Process.py"

#         # Run the script as a subprocess
#         try:
#             result = subprocess.run(["python", script_path], capture_output=True, text=True, check=True)
#             logger.info("Subprocess output:\n" + result.stdout)
#         except subprocess.CalledProcessError as e:
#             logger.error("Error during subprocess execution:\n" + e.stderr)
#     else:
#         logger.error("No folder paths provided")