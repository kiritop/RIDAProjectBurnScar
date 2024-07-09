import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os
import geopandas as gpd
import reverse_geocoder as rg
import pycountry
import random
import math
import fiona
import rasterio

from shapely.geometry import shape, mapping
from scipy.ndimage import label
from rasterio.features import shapes
from pyproj import Transformer, CRS

def create_polygon(input_raster_path, output_shapefile_path):
    # Step 1: Read the raster file
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

    return len(polygons), num_to_show, total_area

if __name__ == "__main__":
    input_raster_path = r"raster/T47QME_20210318T035539_combined_mask.tif"
    output_shapefile_path = r'polygon/burn_condition.shp'
    
    total_polygons, shown_polygons, total_area = create_polygon(input_raster_path, output_shapefile_path)
    
    print(f"Total number of polygons: {total_polygons}")
    print(f"Number of polygons shown: {shown_polygons}")
    print(f"Total burn area: {total_area:.2f} square meters")