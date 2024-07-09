import os
import shutil
import time
from threading import Timer
from time import gmtime, strftime
import numpy as np
import pandas as pd
from matplotlib import pyplot as plt
from skimage import measure
import rasterio
from rasterio.transform import from_origin
from rasterio.enums import Resampling
import geopandas as gpd
from rasterio.features import shapes
from shapely.geometry import shape
from rasterio.warp import transform
import warnings
import csv
import dask.dataframe as dd  # Using Dask for handling large dataframes
from concurrent.futures import ThreadPoolExecutor  # For parallel processing
import logging
import waterdetect as wd

warnings.filterwarnings(action='ignore')

systemCooldown = 2
Error_Limit = 1
mode = True

# Define paths with double backslashes
Drive = "sentinel_process"
Image = os.path.join(Drive, "Image")
Image_Pre = os.path.join(Drive, "Image_Pre")
Image_Finish = os.path.join(Drive, "Image_Finish")
Image_Missing = os.path.join(Drive, "Image_Missing")
Output = os.path.join(Drive, "Output")
Rtbcon = os.path.join(Drive, "Raster_Burncon")
Rtbreg = os.path.join(Drive, "Raster_Burnreg")
RtbShape = os.path.join(Drive, "Raster_Burnshape")
RtbLevel = os.path.join(Drive, "Raster_Burnlevel")


def loadCooldown():
    global mode

def print_time():
    return time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

def Move_File(FileName, CurrDir, DestDir):
    try:
        if os.path.exists(os.path.join(CurrDir, FileName)):
            if os.path.exists(os.path.join(DestDir, FileName)):
                os.remove(os.path.join(DestDir, FileName))
            shutil.copy(os.path.join(CurrDir, FileName), DestDir)
            t = Timer(1, loadCooldown)
            t.start()
            t.join()
            os.remove(os.path.join(CurrDir, FileName))
            print(print_time() + f"Raster_Process :: Move File {FileName} Complete")
    except Exception as e:
        print(print_time() + f"Raster_Process :: Can not Move File {FileName}")
        print(print_time() + str(e))


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def read_and_resample(image_path, target_shape):
    with rasterio.open(image_path) as dataset:
        data = dataset.read(
            out_shape=(
                dataset.count,
                target_shape[0],
                target_shape[1]
            ),
            resampling=rasterio.enums.Resampling.bilinear
        )
        transform = dataset.transform * dataset.transform.scale(
            (dataset.width / target_shape[1]),
            (dataset.height / target_shape[0])
        )
        return data, transform
    
def get_target_shape(image_path):
    with rasterio.open(image_path) as dataset:
        return dataset.height, dataset.width


def generate_mask(input_files, Full_name, Track, Rtbcon):
    target_shape = get_target_shape(input_files['Green'])  # Assuming 'Green' band is the reference

    # Read and resample images
    bands = {}
    for key, path in input_files.items():
        data, transform = read_and_resample(path, target_shape)
        bands[key] = data.squeeze() / 10000

    # Load the configuration
    config = wd.DWConfig(config_file='WaterDetect.ini')

    # Run the water detection
    wmask = wd.DWImageClustering(bands=bands, bands_keys=['Nir', 'ndwi'], invalid_mask=None, config=config)
    mask = wmask.run_detect_water()

    # Create a binary mask where value 0 and 2 are 1, and others are 0
    binary_mask = np.isin(wmask.cluster_matrix, [0, 2]).astype(np.uint8)

    # Save the binary mask as a GeoTIFF
    output_filename = f"{Full_name[:-6]}_Mask.tif"
    output_dir = os.path.join(Rtbcon, Track)
    os.makedirs(output_dir, exist_ok=True)
    mask_tif_path = os.path.join(output_dir, output_filename)

    with rasterio.open(input_files['Green']) as src:
        meta = src.meta.copy()
        meta.update(driver='GTiff', dtype=rasterio.uint8, count=1)
        with rasterio.open(mask_tif_path, 'w', **meta) as dst:
            dst.write(binary_mask, 1)
    
    return mask_tif_path


def process_bands(Image, Track, Mid_name, Full_name, Rtbcon):
    try:
        band_names = ['B03', 'B04', 'B0510', 'B0610', 'B0710', 'B08', 'B8A10', 'B0910', 'B1210']
        band_paths = [os.path.join(Image, Track, f"{Mid_name}{band}.jp2") for band in band_names]

        # Check if all band paths exist
        for path in band_paths:
            if not os.path.exists(path):
                logger.error(f"File does not exist: {path}")
                return

        # Generate the mask
        input_files = {
            'Green': band_paths[0],
            'Nir': band_paths[5],
            'Red': band_paths[1],
            'Mir': band_paths[6],
            'Mir2': band_paths[8]
        }

        # Log input files
        for key, path in input_files.items():
            logger.info(f"Input file {key}: {path}")

        mask_tif_path = generate_mask(input_files, Full_name, Track, Rtbcon)

        # Read the mask
        with rasterio.open(mask_tif_path) as mask_src:
            mask_data = mask_src.read(1)

        # Process the bands and apply the mask
        bands_data = []
        metadata = None
        target_shape = get_target_shape(input_files['Green'])  # Use the same target shape for all bands

        for path in band_paths:
            data, transform = read_and_resample(path, target_shape)
            data = data.squeeze()
            # Apply mask: set pixels to 0 where mask is 1
            data[mask_data == 1] = 0
            bands_data.append(data)

            if metadata is None:
                metadata = rasterio.open(path).meta.copy()
                metadata.update(count=len(band_paths), dtype=data.dtype, driver='GTiff', compress='lzw', predictor=2)

        # Save the combined GeoTIFF
        output_filename = f"{Full_name[:-6]}_combined.tif"
        output_dir = os.path.join(Rtbcon, Track)
        os.makedirs(output_dir, exist_ok=True)
        output_tif_path = os.path.join(output_dir, output_filename)

        with rasterio.open(output_tif_path, 'w', **metadata) as dst:
            for i, (band, description) in enumerate(zip(bands_data, band_names), start=1):
                dst.write(band, i)
                dst.set_band_description(i, description)

        logger.info(f"Combined GeoTIFF created successfully: {output_tif_path}")

        # Delete the mask file after use
        if os.path.exists(mask_tif_path):
            os.remove(mask_tif_path)
            logger.info(f"Mask file deleted: {mask_tif_path}")

    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")


def Raster_Process(Track):
    global mode, Image, Image_Pre, Image_Finish, Image_Missing, Output, Error_Limit
    Loop_Limit = 0
    image_track = os.path.join(Image, Track)
    rasters = [r for r in os.listdir(image_track) if r.endswith('B1210.jp2')]

    for raster in rasters:
        if Loop_Limit > 0:
            mode = True
            return
        Full_name = os.path.splitext(raster)[0]
        Mid_name = Full_name[:23]
        Short_name = Full_name[:6]

        AFB02 = os.path.join(Image, Track, f"{Mid_name}B02.jp2")
        AFB03 = os.path.join(Image, Track, f"{Mid_name}B03.jp2")
        AFB04 = os.path.join(Image, Track, f"{Mid_name}B04.jp2")
        AFB0510 = os.path.join(Image, Track, f"{Mid_name}B0510.jp2")
        AFB0610 = os.path.join(Image, Track, f"{Mid_name}B0610.jp2")
        AFB0710 = os.path.join(Image, Track, f"{Mid_name}B0710.jp2")
        AFB08 = os.path.join(Image, Track, f"{Mid_name}B08.jp2")
        AFB8A10 = os.path.join(Image, Track, f"{Mid_name}B8A10.jp2")
        AFB0910 = os.path.join(Image, Track, f"{Mid_name}B0910.jp2")
        AFB1210 = os.path.join(Image, Track, f"{Mid_name}B1210.jp2")

        if all(
            [
                os.path.exists(AFB02), os.path.exists(AFB03), os.path.exists(AFB04), 
                os.path.exists(AFB0510), os.path.exists(AFB0610), os.path.exists(AFB0710), 
                os.path.exists(AFB8A10), os.path.exists(AFB08), os.path.exists(AFB0910), 
                os.path.exists(AFB1210)
            ]
        ):
            Loop_Limit += 1
            t = Timer(3, loadCooldown)
            t.start()
            t.join()

            try:
                process_bands(Image, Track, Mid_name, Full_name, Rtbcon)
            except Exception as e:
                logger.error(f"Raster_Process :: Error processing {Full_name}")
                logger.error(str(e))

                Error_Limit -= 1
                if Error_Limit < 1:
                    logger.error("Raster_Process :: Error limit reached. Moving files to Image_Missing.")
                    for band in ['B03', 'B04', 'B08', 'B12', 'B1210']:
                        Move_File(f"{Mid_name}{band}.jp2", os.path.join(Image, Track), os.path.join(Image_Missing, Track))
                        Move_File(f"{Mid_name}{band}.jp2.aux.xml", os.path.join(Image, Track), os.path.join(Image_Missing, Track))
                        Move_File(f"{Mid_name}{band}.jp2.ovr", os.path.join(Image, Track), os.path.join(Image_Missing, Track))
                        Move_File(f"{Mid_name}{band}.jp2.xml", os.path.join(Image, Track), os.path.join(Image_Missing, Track))
                    Error_Limit = 2
        else:
            logger.info(f"{Full_name[:22]} Image not found!")
            for band in ['B03', 'B04', 'B08', 'B12', 'B1210']:
                Move_File(f"{Mid_name}{band}.jp2", os.path.join(Image, Track), os.path.join(Image_Missing, Track))
                Move_File(f"{Mid_name}{band}.jp2.aux.xml", os.path.join(Image, Track), os.path.join(Image_Missing, Track))
                Move_File(f"{Mid_name}{band}.jp2.ovr", os.path.join(Image, Track), os.path.join(Image_Missing, Track))
                Move_File(f"{Mid_name}{band}.jp2.xml", os.path.join(Image, Track), os.path.join(Image_Missing, Track))

    logger.info("Wait New Raster ::")
    mode = True

def main():
    current_dir = os.getcwd()
    logger.info(f"Current Working Directory: {current_dir}")
    logger.info("Application Start ::")

    # Get the list of directories inside the 'Image' directory
    image_directories = [d for d in os.listdir(Image) if os.path.isdir(os.path.join(Image, d))]

    for area_dir in image_directories:
        area_path = os.path.join(Image, area_dir)
        rasters = [r for r in os.listdir(area_path) if r.endswith('B1210.jp2')]
        if rasters:
            mode = False
            logger.info(f"Found NEW Raster in Area: {area_dir}")
            try:
                Raster_Process(area_dir)
            except Exception as e:
                logger.error("!!!!!!!!!SYSTEM ERROR !!!!!!!!!!!")
                logger.error(str(e))
                logger.info("Wait New Raster ::")
        else:
            logger.info(f"No rasters found in directory: {area_path}")

    logger.info(f"{len(image_directories)} Area(s) processed.")

main()

# # NDWI cut

# import os
# import shutil
# import time
# from threading import Timer
# from time import gmtime, strftime
# import numpy as np
# import pandas as pd
# from matplotlib import pyplot as plt
# from skimage import measure
# import rasterio
# from rasterio.transform import from_origin
# from rasterio.enums import Resampling
# import geopandas as gpd
# from rasterio.features import shapes
# from shapely.geometry import shape
# from rasterio.warp import transform
# import warnings
# import csv
# import dask.dataframe as dd  # Using Dask for handling large dataframes
# from concurrent.futures import ThreadPoolExecutor  # For parallel processing
# import logging

# warnings.filterwarnings(action='ignore')

# systemCooldown = 2
# Error_Limit = 1
# mode = True

# # Define paths with double backslashes
# Drive = "sentinel_process"
# Image = os.path.join(Drive, "Image")
# Image_Pre = os.path.join(Drive, "Image_Pre")
# Image_Finish = os.path.join(Drive, "Image_Finish")
# Image_Missing = os.path.join(Drive, "Image_Missing")
# Output = os.path.join(Drive, "Output")
# Rtbcon = os.path.join(Drive, "Raster_Burncon")
# Rtbreg = os.path.join(Drive, "Raster_Burnreg")
# RtbShape = os.path.join(Drive, "Raster_Burnshape")
# RtbLevel = os.path.join(Drive, "Raster_Burnlevel")

# # Adjusted file paths in Track_arr list
# # Track_arr = [
# #     "T48QUH\\" ,"T48QUT\\","T48PTV\\"
# # ]

# # Track_arr = []

# def loadCooldown():
#     global mode

# def print_time():
#     return time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

# def Move_File(FileName, CurrDir, DestDir):
#     try:
#         if os.path.exists(os.path.join(CurrDir, FileName)):
#             if os.path.exists(os.path.join(DestDir, FileName)):
#                 os.remove(os.path.join(DestDir, FileName))
#             shutil.copy(os.path.join(CurrDir, FileName), DestDir)
#             t = Timer(1, loadCooldown)
#             t.start()
#             t.join()
#             os.remove(os.path.join(CurrDir, FileName))
#             print(print_time() + f"Raster_Process :: Move File {FileName} Complete")
#     except Exception as e:
#         print(print_time() + f"Raster_Process :: Can not Move File {FileName}")
#         print(print_time() + str(e))


# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# def process_bands(Image, Track, Mid_name, Full_name, Rtbcon):
#     try:
#         band_names = ['B03', 'B04', 'B0510', 'B0610', 'B0710', 'B08', 'B8A10', 'B0910', 'B1210']
#         band_paths = [os.path.join(Image, Track, f"{Mid_name}{band}.jp2") for band in band_names]
        
#         # Extract capture date from filename
#         capture_date = Full_name[7:15]  # Assuming the date is in YYYYMMDD format
        
#         custom_band_descriptions = [
#             'Green (B03)',
#             'Red (B04)',
#             'Vegetation Red Edge (B05)',
#             'Vegetation Red Edge (B06)',
#             'Vegetation Red Edge (B07)',
#             'NIR (B08)',
#             'Narrow NIR (B8A)',
#             'Water Vapour (B09)',
#             'SWIR-Cirrus (B12)'
#         ]

#         logger.info("Starting GeoTIFF Process")
#         bands_data = {}
#         metadata = None

#         # Read all bands and store data
#         for path, band_name in zip(band_paths, band_names):
#             with rasterio.open(path) as src:
#                 data = src.read(1)
#                 if data.min() >= 0 and data.max() <= 65535:
#                     data = data.astype(np.uint16)
#                 bands_data[band_name] = data
#                 if metadata is None:
#                     metadata = src.meta.copy()
#                     metadata.update(
#                         count=len(band_paths),
#                         dtype=data.dtype,
#                         driver='GTiff',
#                         compress='lzw',
#                         predictor=2
#                     )

#         # Create mask condition
#         data_AFB03 = bands_data['B03']
#         data_AFB08 = bands_data['B08']
#         burn_condition = np.where(data_AFB08 > data_AFB03, 1, 0)

#         # Apply mask to all bands
#         for key in bands_data:
#             bands_data[key][burn_condition == 0] = 0

#         output_filename = f"{Full_name[:-6]}_combined.tif"
#         output_dir = os.path.join(Rtbcon, Track)
#         os.makedirs(output_dir, exist_ok=True)
#         output_tif_path = os.path.join(output_dir, output_filename)

#         with rasterio.open(output_tif_path, 'w', **metadata) as dst:
#             for i, (band_name, description) in enumerate(zip(band_names, custom_band_descriptions), start=1):
#                 dst.write(bands_data[band_name], i)
#                 dst.set_band_description(i, description)
            
#             # Add capture date to the TIFF tags
#             dst.update_tags(CAPTURE_DATE=capture_date)

#         logger.info("Combined GeoTIFF created successfully")
#         logger.info(f"Output file: {output_tif_path}")

#         # Verify band descriptions and capture date
#         with rasterio.open(output_tif_path, 'r') as src:
#             for i in range(1, src.count + 1):
#                 logger.info(f"Band {i} description: {src.descriptions[i-1]}")
#             logger.info(f"Capture Date: {src.tags().get('CAPTURE_DATE', 'Not found')}")

#     except Exception as e:
#         logger.error(f"An error occurred: {str(e)}")

# def Raster_Process(Track):
#     global mode, Image, Image_Pre, Image_Finish, Image_Missing, Output, Error_Limit
#     Loop_Limit = 0
#     image_track = os.path.join(Image, Track)
#     rasters = [r for r in os.listdir(image_track) if r.endswith('B1210.jp2')]

#     for raster in rasters:
#         if Loop_Limit > 0:
#             mode = True
#             return
#         Full_name = os.path.splitext(raster)[0]
#         Mid_name = Full_name[:23]
#         Short_name = Full_name[:6]

#         AFB02 = os.path.join(Image, Track, f"{Mid_name}B02.jp2")
#         AFB03 = os.path.join(Image, Track, f"{Mid_name}B03.jp2")
#         AFB04 = os.path.join(Image, Track, f"{Mid_name}B04.jp2")
#         AFB0510 = os.path.join(Image, Track, f"{Mid_name}B0510.jp2")
#         AFB0610 = os.path.join(Image, Track, f"{Mid_name}B0610.jp2")
#         AFB0710 = os.path.join(Image, Track, f"{Mid_name}B0710.jp2")
#         AFB08 = os.path.join(Image, Track, f"{Mid_name}B08.jp2")
#         AFB8A10 = os.path.join(Image, Track, f"{Mid_name}B8A10.jp2")
#         AFB0910 = os.path.join(Image, Track, f"{Mid_name}B0910.jp2")
#         AFB1210 = os.path.join(Image, Track, f"{Mid_name}B1210.jp2")

#         tile = Short_name
#         date = Full_name[7:15] 

#         print(print_time() + f"Checking files for {Full_name}")
#         file_check = {
#             "AFB02": os.path.exists(AFB02),
#             "AFB03": os.path.exists(AFB03),
#             "AFB04": os.path.exists(AFB04),
#             "AFB0510": os.path.exists(AFB0510),
#             "AFB0610": os.path.exists(AFB0610),
#             "AFB0710": os.path.exists(AFB0710),
#             "AFB08": os.path.exists(AFB08),
#             "AFB8A10": os.path.exists(AFB8A10),
#             "AFB0910": os.path.exists(AFB0910),
#             "AFB1210": os.path.exists(AFB1210),
#         }
#         for key, value in file_check.items():
#             print(f"{key}: {value}")

#         if all(
#             [
#                 os.path.exists(AFB02), os.path.exists(AFB03), os.path.exists(AFB04), 
#                 os.path.exists(AFB0510), os.path.exists(AFB0610), os.path.exists(AFB0710), 
#                 os.path.exists(AFB8A10), os.path.exists(AFB08), os.path.exists(AFB0910), 
#                 os.path.exists(AFB1210)
#             ]
#         ):
#             print(print_time() + "Raster_Process :: Start Raster Process Please Wait....")
#             Loop_Limit += 1
#             t = Timer(3, loadCooldown)
#             t.start()
#             t.join()

#             try:
#                 print(print_time()+"Raster_Process :: Raster Process " + Full_name[:22])

#                 with rasterio.open(AFB02) as src_AFB02:
#                     data_AFB02 = src_AFB02.read(1)
#                     print("Shape of data_AFB02:", data_AFB02.shape) 
                    
#                 with rasterio.open(AFB03) as src_AFB03:
#                     data_AFB03 = src_AFB03.read(1)
#                     print("Shape of data_AFB03:", data_AFB03.shape) 

#                 with rasterio.open(AFB04) as src_AFB04:
#                     data_AFB04 = src_AFB04.read(1)
#                     print("Shape of data_AFB04:", data_AFB04.shape)

#                 with rasterio.open(AFB0510) as src_AFB0510:
#                     data_AFB0510 = src_AFB0510.read(1)
#                     print("Shape of data_AFB05:", data_AFB0510.shape)  
                
#                 with rasterio.open(AFB0610) as src_AFB0610:
#                     data_AFB0610 = src_AFB0610.read(1)
#                     print("Shape of data_AFB06:", data_AFB0610.shape) 
                
#                 with rasterio.open(AFB0710) as src_AFB0710:
#                     data_AFB0710 = src_AFB0710.read(1)
#                     print("Shape of data_AFB07:", data_AFB0710.shape)  
                
#                 with rasterio.open(AFB08) as src_AFB08, rasterio.open(AFB8A10) as src_AFB8A10:
#                     data_AFB08 = src_AFB08.read(1)
#                     data_AFB8A10 = src_AFB8A10.read(1)
#                     print("Shape of data_AFB08:", data_AFB08.shape)  
#                     print("Shape of data_AFB8A:", data_AFB8A10.shape)  

#                 with rasterio.open(AFB0910) as src_AFB0910:
#                     data_AFB0910 = src_AFB0910.read(1) 
#                     print("Shape of data_AFB09:", data_AFB0910.shape)  

#                 with rasterio.open(AFB1210) as src_AFB1210:
#                     data_AFB1210 = src_AFB1210.read(1)

#                     print("Shape of data_AFB12:", data_AFB1210.shape)

#                 afb08_shape = data_AFB08.shape
#                 data_AFB02 = np.resize(data_AFB02, afb08_shape)
#                 data_AFB03 = np.resize(data_AFB03, afb08_shape)
#                 data_AFB04 = np.resize(data_AFB04, afb08_shape)
#                 data_AFB0510 = np.resize(data_AFB0510, afb08_shape)
#                 data_AFB0610 = np.resize(data_AFB0610, afb08_shape)
#                 data_AFB0710 = np.resize(data_AFB0710, afb08_shape)
#                 data_AFB8A10 = np.resize(data_AFB8A10, afb08_shape)
#                 data_AFB0910 = np.resize(data_AFB0910, afb08_shape)
#                 data_AFB1210 = np.resize(data_AFB1210, afb08_shape)

#                 print("Shape of data_AFB02 (Reshape):", data_AFB02.shape) 
#                 print("Shape of data_AFB03 (Reshape):", data_AFB03.shape)  
#                 print("Shape of data_AFB04 (Reshape):", data_AFB04.shape)
#                 print("Shape of data_AFB05 (Reshape):", data_AFB0510.shape)  
#                 print("Shape of data_AFB06 (Reshape):", data_AFB0610.shape) 
#                 print("Shape of data_AFB07 (Reshape):", data_AFB0710.shape)  
#                 print("Shape of data_AFB08 (Reshape):", data_AFB08.shape)  
#                 print("Shape of data_AFB8A (Reshape):", data_AFB8A10.shape)  
#                 print("Shape of data_AFB09 (Reshape):", data_AFB0910.shape)  
#                 print("Shape of data_AFB12 (Reshape):", data_AFB1210.shape) 

#                 process_bands(Image, Track, Mid_name, Full_name, Rtbcon)


#             except Exception as e:
#                 print(print_time()+"Raster_Process :: !!!!!!!!!! RASTER ERROR !!!!!!!!!!")
#                 print(print_time() + str(e))
#                 Error_Limit = Error_Limit - 1
#                 if Error_Limit < 1 :
#                     print(print_time()+"Raster_Process :: !!!!!!!!!! RASTER ERROR 2 Time MoveFile to Image_Missin")
#                     Move_File(Mid_name + "B03.jp2", Image + Track, Image_Missing + Track)
#                     Move_File(Mid_name + "B04.jp2", Image + Track, Image_Missing + Track)
#                     Move_File(Mid_name + "B08.jp2", Image + Track, Image_Missing + Track)
#                     Move_File(Mid_name + "B12.jp2", Image + Track, Image_Missing + Track)
#                     Move_File(Mid_name + "B1210.jp2", Image + Track, Image_Missing + Track)
#                     Move_File(Mid_name + "B1210.jp2.aux.xml", Image + Track, Image_Missing + Track)
#                     Move_File(Mid_name + "B1210.jp2.ovr", Image + Track, Image_Missing + Track)
#                     Move_File(Mid_name + "B1210.jp2.xml", Image + Track, Image_Missing + Track)
#                     Error_Limit = 2

#         else:
#             print(print_time() + f"Raster_Process :: {Full_name[:22]} Image not Found !!!!")
#             print(AFB03, "_", os.path.exists(AFB03))
#             print(AFB04, "_", os.path.exists(AFB04))
#             print(AFB08, "_", os.path.exists(AFB08))
#             Move_File(f"{Mid_name}B03.jp2", os.path.join(Image, Track), os.path.join(Image_Missing, Track))
#             Move_File(f"{Mid_name}B04.jp2", os.path.join(Image, Track), os.path.join(Image_Missing, Track))
#             Move_File(f"{Mid_name}B08.jp2", os.path.join(Image, Track), os.path.join(Image_Missing, Track))
#             Move_File(f"{Mid_name}B12.jp2", os.path.join(Image, Track), os.path.join(Image_Missing, Track))
#             Move_File(f"{Mid_name}B1210.jp2", os.path.join(Image, Track), os.path.join(Image_Missing, Track))
#             Move_File(f"{Mid_name}B1210.jp2.aux.xml", os.path.join(Image, Track), os.path.join(Image_Missing, Track))
#             Move_File(f"{Mid_name}B1210.jp2.ovr", os.path.join(Image, Track), os.path.join(Image_Missing, Track))
#             Move_File(f"{Mid_name}B1210.jp2.xml", os.path.join(Image, Track), os.path.join(Image_Missing, Track))
        
#     print(print_time() + "Wait New Raster ::")
#     mode = True



# def main():
#     current_dir = os.getcwd()
#     print("Current Working Directory:", current_dir)
#     global mode, Image_Post
#     print(print_time() + "Application Start ::")

#     # Get the list of directories inside the 'Image' directory
#     image_directories = [d for d in os.listdir(Image) if os.path.isdir(os.path.join(Image, d))]

#     for area_dir in image_directories:
#         area_path = os.path.join(Image, area_dir)
#         rasters = [r for r in os.listdir(area_path) if r.endswith('B1210.jp2')]
#         if rasters:
#             mode = False
#             print(print_time() + f"Found NEW Raster in Area: {area_dir}")
#             try:
#                 Raster_Process(area_dir)
#             except Exception as e:
#                 print(print_time() + "!!!!!!!!!SYSTEM ERROR !!!!!!!!!!!")
#                 print(print_time() + str(e))
#                 print(print_time() + "Wait New Raster ::")
#         else:
#             print(f"No rasters found in directory: {area_path}")

#     print(print_time() + f"{len(image_directories)} Area(s) processed.")

# main()