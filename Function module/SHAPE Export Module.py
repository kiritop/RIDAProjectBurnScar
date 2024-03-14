# Related third party imports.
import pandas as pd
import geopandas as gpd
import requests
from shapely.geometry import Point

def csv_to_shape(data_path, shape_file_name, long_col='longitude', lat_col='latitude'):
    """
    Transform a CSV file to a SHAPE file.

    Args:
        csv_file_name (str): The name of the CSV file to transform.
        shape_file_name (str): The name of the SHAPE file to create.
        lon_col (str, optional): The name of the longitude column in the CSV file. Default is 'longitude'.
        lat_col (str, optional): The name of the latitude column in the CSV file. Default is 'latitude'.
    """
    # Load the CSV data into a GeoDataFrame
    df = pd.read_csv(data_path)
    geometry = [Point(xy) for xy in zip(df[long_col], df[lat_col])]
    gdf = gpd.GeoDataFrame(df, geometry=geometry)

    # Export the GeoDataFrame as a SHAPE file
    gdf.to_file(shape_file_name, driver='ESRI Shapefile')

def main():
    data_path = pd.read_csv('')
    
    lat_col = pd.DataFrame(data_path[['LATITUDE']])
    long_col = pd.DataFrame(data_path[['LONGITUDE']])

    csv_to_shape('predictions.csv', 'Burn Area Predictions.shp')

# For running in a script mode
if __name__ == "__main__":
    main()