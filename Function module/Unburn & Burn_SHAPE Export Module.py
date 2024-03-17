# Related third party imports.
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter

def csv_to_shape(data_path, csv_full_path, shape_full_path):
    """
    Transform a CSV file to a SHAPE file.

    Args:
        data_path (str): The path to the CSV file to transform.
        shape_file_name (str): The name of the SHAPE file to create.
    """
    # Load the CSV data into a DataFrame
    df = pd.read_csv(data_path)
    df["True_Label"] = df["True_Label"].astype(int)

    # Join the latitude and longitude points into one column
    df["coordinates"] = df["Latitude"].apply(str)+ ", " +df["Longitude"].apply(str)

    # Reverse geocode
    geolocator = Nominatim(user_agent="Siripoom Suwanmanee", timeout=30)
    rgeocode = RateLimiter(geolocator.reverse, min_delay_seconds=0.1)
    df["location"] = df["coordinates"].apply(lambda x: 
                                                       rgeocode(x, language='en').address 
                                                       if rgeocode(x, language='en') else None)

    # Create a GeoDataFrame
    geometry = [Point(xy) for xy in zip(df['Longitude'], df['Latitude'])]
    gdf = gpd.GeoDataFrame(df, geometry=geometry)

    # Export CSV without Geometry
    df.to_csv(csv_full_path, index=False, encoding='utf-8')

    # Export the GeoDataFrame as a SHAPE file
    gdf.to_file(shape_full_path, driver='ESRI Shapefile')

def main():

    # Path for CSV import
    data_path = (r'D:\Work\Code งาน\Lab-docker\RIDA\Doi Chang 2023 Burn_Area_Predictions.csv')

    # Path for export SHAPE and CSV without Geometry
    csv_without_geometry_path = (r'D:\Work\Code งาน\Lab-docker\RIDA\Results\CSV without Geometry\Doi Chang\2023')
    shape_folder_path = (r'D:\Work\Code งาน\Lab-docker\RIDA\Results\SHAPE File\Doi Chang\2023')
    csv_file_name = 'Doi Change 2023 Burn Area Predictions.csv'
    shape_file_name = 'Doi Change 2023 Burn Area Predictions.shp'
    csv_full_path = csv_without_geometry_path + csv_file_name
    shape_full_path = shape_folder_path + shape_file_name

    # Call Function
    csv_to_shape(data_path, csv_full_path, shape_full_path)
    print(gpd.read_file(shape_full_path))

# For running in a script mode
if __name__ == "__main__":
    main()
