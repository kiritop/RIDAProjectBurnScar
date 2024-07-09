# RIDA Data En + Machine Learning

### Prerequisites
- pandas
- numpy
- matplotlib
- pickle
- os
- geopandas
- reverse_geocoder
- pycountry
- pymysql
- random
- math
- logging
- shutil
- re
- fiona
- rasterio
- shapely
- collections
- IPython
- sklearn
- scipy
- pyproj
- threading
- time
- skimage
- warnings
- csv
- dask
- concurrent.futures
- waterdetect
- subprocess
- datetime
- ast
- gdl

<br>
- Also can run on `./test.ipynb` notebook

### Imports & Settings


```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import pickle
import os
import geopandas as gpd
import reverse_geocoder as rg
import pycountry
import pymysql
import random
import math
import numpy as np
import logging
import shutil
import re
import fiona
import rasterio
import fiona


from shapely.geometry import MultiPoint , shape, mapping
from collections import Counter
from IPython.display import display
from sklearn import metrics
from sklearn.metrics import silhouette_score
from sklearn.cluster import KMeans, DBSCAN
from scipy.ndimage import label
from rasterio.features import shapes
from rasterio.plot import show
from shapely.geometry import shape, mapping
from scipy.ndimage import label
from pyproj import Transformer, CRS


from image_processing import data_preparation
import sentinel_process

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()
```

### Data Preparation


![png]('material/flow.png')


'data_preparation' function is image processing which will resample satellite image(jp2) all range into 10m
and move into 'sentinel_process/Image' folder. And next step finction will call subprocess 'sentinel_process.py'.

'sentinel_process.py' is subprocess file which are contain function 'process_bands' it will use 'sentinel_process/Image'
folder for read raster from 'data_preparation' here is step of subprocess

 - Step 1 : check all raster are in 'sentinel_process/Image' 
 - Step 2 : generate water detect mask using waterdect library (concept and reference from Maurício Cordeiro)
 - Step 3 : process_bands function is read all raster and combine band and save into GeoTiff 
 - Step 4 : use water mask.tiff and combine.tiff merge together and which raster map to mask made value = 0
 - step 5 : save .tif to 'raster' folder for predict and modeling step

### Modeling

```python
# Define the preprocessing function
def preprocess(df, scaler_path):
    new_column_names = [
        'Band_3_Post', 'Band_4_Post', 'Band_5_Post', 'Band_6_Post',
        'Band_7_Post', 'Band_8_Post', 'Band_8A_Post', 'Band_9_Post', 'Band_12_Post'
    ]
    rename_dict = dict(zip(df.columns[:len(new_column_names)], new_column_names))
    df_rename = df.rename(columns=rename_dict)

    with open(scaler_path, 'rb') as f:
        scaler = pickle.load(f)

    df_normalized = scaler.transform(df_rename)
    df_normalized = pd.DataFrame(df_normalized, columns=df_rename.columns)
    df_rename = df_normalized.rename(columns=rename_dict)

    return df_rename
```

```python
# Define the prediction function
def make_predictions(directory, df_rename):
    loaded_model = pickle.load(open(directory, 'rb'))
    y_pred = loaded_model.predict(df_rename)
    df_rename["BURN_PREDICTED"] = y_pred
    label_counts = Counter(y_pred)
    print("\nCount of each predicted label:")
    for label, count in label_counts.items():
        print(f"Label {label}: {count}")

    return df_rename
```

```python
# Define the function to create GeoTIFF from predictions
def create_geotiff_from_predictions(predictions, original_tif_path, output_tif_path):
    with rasterio.open(original_tif_path) as src:
        original_metadata = src.meta.copy()
    
    original_metadata.update({
        'dtype': 'uint8',
        'count': 1,
    })

    band_1 = predictions.values.reshape((original_metadata['height'], original_metadata['width']))

    with rasterio.open(output_tif_path, 'w', **original_metadata) as new_img:
        new_img.write(band_1, 1)

    print(f"New GeoTIFF file '{output_tif_path}' has been created.")

```

```python
# Directory containing the raster files
raster_dir = r"raster"
scaler_path = r"model/min_max_scaler.pkl"
model_path = r"model/Model_LGBM.sav"
```


```python
# Loop through each file in the directory
for file_name in os.listdir(raster_dir):
    if file_name.endswith(".tif"):
        file_path = os.path.join(raster_dir, file_name)

        # Extract year from the filename using regex
        match = re.search(r'_(\d{4})', file_name)
        if match:
            year = match.group(1)

            # Process the file
            img = rasterio.open(file_path)
            array = img.read()
            n_bands = array.shape[0]

            df = pd.DataFrame(array.reshape([n_bands, -1]).T, columns=[f"band_{i+1}" for i in range(n_bands)])
            df_rename = preprocess(df, scaler_path)
            df_predicted = make_predictions(model_path, df_rename)

            # Create GeoTIFF file from predictions
            output_tif_path = os.path.join(raster_dir, f'output_{year}.tif')
            create_geotiff_from_predictions(df_predicted["BURN_PREDICTED"], file_path, output_tif_path)

```

### Create Polygon

```python
# Step 1: Read the raster file
input_raster_path = r"raster/T47QME_20210318T035539_combined_mask.tif"
output_shapefile_path = r'polygon/burn_condition.shp'

with rasterio.open(input_raster_path) as src:
    raster_data = src.read(1)  # Read the first band
    transform = src.transform  # Get the affine transform
    crs = src.crs  # Get the CRS of the input raster

    # Get the center coordinates of the raster
    center_x = (src.bounds.left + src.bounds.right) / 2
    center_y = (src.bounds.bottom + src.bounds.top) / 2

# Create a transformer to convert from the raster's CRS to WGS84
transformer = Transformer.from_crs(crs, "EPSG:4326", always_xy=True)

# Convert center coordinates to WGS84
center_lon, center_lat = transformer.transform(center_x, center_y)

# Calculate the UTM zone
utm_zone = math.floor((center_lon + 180) / 6) + 1
hemisphere = 'north' if center_lat >= 0 else 'south'

# Create a custom UTM CRS
utm_crs = CRS.from_dict({
    'proj': 'utm',
    'zone': utm_zone,
    'south': hemisphere == 'south'
})

# Create transformer from input CRS to the appropriate UTM CRS
transformer_to_utm = Transformer.from_crs(crs, utm_crs, always_xy=True)

# Use utm_crs instead of the fixed EPSG:32647
projected_crs = utm_crs

# Step 2: Extract features based on burn condition values
burn_condition = (raster_data == 1).astype(np.uint8)

# Label connected components
labeled_array, num_features = label(burn_condition)


# Step 3: Convert labeled features to polygons
shapes_generator = shapes(labeled_array, transform=transform)

polygons = []
for geom, value in shapes_generator:
    if value > 0:  # Only take the features corresponding to burn condition
        polygons.append(shape(geom))

projected_polygons = []
for polygon in polygons:
    # Reproject polygon to UTM
    projected_polygon = shape(mapping(polygon))
    projected_polygon = shape({
        'type': 'Polygon',
        'coordinates': [
            [
                transformer_to_utm.transform(x, y) for x, y in polygon.exterior.coords
            ]
        ]
    })
    projected_polygons.append(projected_polygon)


# Step 4: Calculate total area and save shapefile
total_area = sum(polygon.area for polygon in projected_polygons)

schema = {
    'geometry': 'Polygon',
    'properties': {'id': 'int', 'area_m2': 'float'},
}

os.makedirs(os.path.dirname(output_shapefile_path), exist_ok=True)

with fiona.open(output_shapefile_path, 'w', 'ESRI Shapefile', schema=schema, crs=crs) as shp:
    for i, polygon in enumerate(projected_polygons):
        area_m2 = polygon.area
        shp.write({
            'geometry': mapping(polygon),
            'properties': {'id': i + 1, 'area_m2': area_m2},
        })

print(f"Shapefile saved to {output_shapefile_path}")
print(f"Total burn area: {total_area:.2f} square meters\n")

# Reverse geocode to get city and province
def get_location_info(x, y):
    lon, lat = transformer.transform(x, y)
    coordinates = (lat, lon)  # Note the order: (latitude, longitude)
    result = rg.search(coordinates)
    if result:
        location = result[0]
        city = location['name']
        province = location['admin1']
        country_code = location['cc']
        try:
            country = pycountry.countries.get(alpha_2=country_code).name
        except AttributeError:
            country = "Unknown"
        return city, province, country, lat, lon
    return None, None, None, lat, lon

# Step 5: Print properties and plot the output
fig, ax = plt.subplots(figsize=(10, 10))

# Plot the original raster data
ax.imshow(raster_data, cmap='gray', extent=(transform[2], transform[2] + transform[0] * raster_data.shape[1], 
                                            transform[5] + transform[4] * raster_data.shape[0], transform[5]))
ax.set_title("Burn Condition Raster and Random Sample of Polygons")

# Determine the number of polygons to show (e.g., 5 or 10% of total, whichever is smaller)
num_to_show = min(5, int(len(polygons) * 0.1))

# Randomly select polygons to show
polygons_to_show = random.sample(range(len(polygons)), num_to_show)

# Plot the selected polygons and print their properties
for i in polygons_to_show:
    polygon = polygons[i]
    x, y = polygon.exterior.xy
    ax.plot(x, y, color='red', linewidth=2)
    
    # Get centroid of the polygon for reverse geocoding
    centroid = polygon.centroid
    city, province, country, lat, lon = get_location_info(centroid.x, centroid.y)
    area_m2 = projected_polygons[i].area  # Get area from projected polygon
    
    # Annotate the polygon with its ID
    ax.annotate(str(i+1), (centroid.x, centroid.y), color='white', fontweight='bold', ha='center', va='center')
    
    print(f"Polygon {i+1}:")
    print(f"  Centroid: ({lat:.6f}, {lon:.6f})")
    print(f"  City: {city}, Province: {province}, Country: {country}")
    print(f"  Area: {area_m2:.4f} square meters")
    print()

plt.tight_layout()
plt.show()

# Print summary statistics
print(f"Total number of polygons: {len(polygons)}")
print(f"Number of polygons shown: {num_to_show}")
print(f"Total burn area: {total_area:.2f} square meters")

```

## Machine Learning
### Prerequisites
- Python 3.11.9
- rasterio: A library for reading and writing geospatial raster data. It provides tools to work with raster datasets and perform operations such as reading, writing, and processing raster files.
- numpy: A fundamental package for scientific computing in Python. It supports large, multi-dimensional arrays and matrices, and comes with a wide range of mathematical functions to operate on these arrays.
- pandas: A powerful data manipulation and analysis library for Python. It provides data structures like Series and DataFrame for handling and analyzing structured data efficiently.
- pickle: A Python module used for serializing and de-serializing Python object structures, also called "pickling" and "unpickling". It is useful for saving Python objects to a file and loading them back.
- collections.Counter: A subclass of the dictionary that helps count hashable objects. It is an easy way to count occurrences of items.
- os: A module that provides a way of using operating system dependent functionality like reading or writing to the file system.
- geopandas: An extension of pandas that supports spatial data operations. It provides tools to work with geospatial data, including reading and writing shapefiles, GeoJSON, and other formats.
- shapely.geometry.shape: Part of the Shapely library, it is used to create geometric objects from GeoJSON-like dicts. It supports various geometric operations.
- scipy: A function in the SciPy library for image processing. It is used to label connected components in an array, which is useful for segmenting and analyzing images.
- reverse_geocoder: A library for performing reverse geocoding, which is the process of converting geographic coordinates (latitude, longitude) into human-readable addresses.
- pycountry: A library that provides ISO country, subdivision, and currency definitions. It is useful for accessing standardized information about countries and regions.
- datetime: A module that supplies classes for manipulating dates and times in both simple and complex ways.
- sklearn.preprocessing.MinMaxScaler: A part of the scikit-learn library used for feature scaling. MinMaxScaler transforms features by scaling them to a given range, usually between 0 and 1.
- logging: A module that provides a flexible framework for emitting log messages from Python programs. It is useful for tracking events that happen during the execution of the program.
- ast: A module that helps Python applications process trees of the Python abstract syntax grammar. It can be used to safely evaluate or manipulate Python expressions.
- shapely.geometry.Polygon: Part of the Shapely library, it is used to create polygon geometric objects. It supports various geometric operations and manipulations.

### Library install
- pip install rasterio numpy pandas pickle5 geopandas shapely scipy reverse_geocoder pycountry scikit-learn
