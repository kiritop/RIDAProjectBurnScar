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

```python
'main.py' are contain big tree function which consists of "data_preparation from 'image_processing.py'" , "predict_main from 'predict_module.py'" and the last one "create_polygon from 'create_polygon.py'"
```

```python
'data_preparation' function is image processing which will resample satellite image(jp2) all range into 10m
and move into 'sentinel_process/Image' folder. And next step finction will call subprocess 'sentinel_process.py'.
```

```python
'sentinel_process.py' is subprocess file which are contain function 'process_bands' it will use 'sentinel_process/Image'
folder for read raster from 'data_preparation' here is step of subprocess

 - Step 1 : Check all raster are in 'sentinel_process/Image' 
 - Step 2 : Generate water detect mask using waterdect library (concept and reference from Maurício Cordeiro)
 - Step 3 : Process_bands function is read all raster and combine band and save into GeoTiff 
 - Step 4 : Use water mask.tiff and combine.tiff merge together and which raster map to mask made value = 0
 - step 5 : Save .tif to 'raster' folder for predict and modeling step
```

```python
'predict_main' function is machine lerning process, The process of function are read rester then using ML for calculate which pixel in raster is burn and output in .tif which is contain burn location

 - Step 1 : The 'predict_main' will read tiff for 'raster' folder and get value of each band into 'df' 
 - Step 2 : The 'df' contain dataframe for predict by using pickle LGBM (Light GBM) which learning from training pipeline
 - Step 3 : Process burn location tif which contain metadata of area and save to 'raster_output'
```

```python
'create_polygon' function is using tif to convert into set of Shape file (cph,dbf,prj,shp,shx) 
 - Step 1 : 'create_polygon' will read .tif from 'raster_output' folder
 - Step 2 : Convert .tif to polygon
```

### Folder Structure

```python

RidaProject
     |_satellite_Image
     |_sentinel_process
          |_Image
          |_Raster_Burncon
     |_model
     |_WaterDectect
     |_raster
     |_raster_output
     |_polygon
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
