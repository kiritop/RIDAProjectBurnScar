# Related third party imports.
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter

pd.set_option('display.max_columns', None)

def csv_to_shape(data_path, shape_full_path):
    """
    Transform a CSV file to a SHAPE file.

    Args:
        data_path (str): The path to the CSV file to transform.
        shape_file_name (str): The name of the SHAPE file to create.
    """
    # Load the CSV data into a DataFrame
    df = pd.read_csv(data_path)
    df["True_Label"] = df["True_Label"].astype(int)
    df_burn = df.query("True_Label == 1").copy() # Query only Label = 1 and Copy
    rows_count = len(df_burn.index) # Count index
    print('Numbers of Burn Class: ', rows_count)

    # Declare Condition to Perform Reverse Geocode
    if (rows_count <= 200):
        # Join the latitude and longitude points into one column
        df_burn["coordinates"] = df_burn["Latitude"].astype(str)+ ", " +df_burn["Longitude"].astype(str)

        # Reverse geocode
        geolocator = Nominatim(user_agent="WHSAPS", timeout=30)
        rgeocode = RateLimiter(geolocator.reverse, min_delay_seconds=0.1)
        df_burn["location"] = df_burn["coordinates"].apply(lambda x: 
                                                        rgeocode(x, language='en').address 
                                                        if rgeocode(x, language='en') else None)
        
        # Create a GeoDataFrame
        geometry = [Point(xy) for xy in zip(df_burn['Longitude'], df_burn['Latitude'])]
        gdf = gpd.GeoDataFrame(df_burn, geometry=geometry)

        # Drop the 'coordinates' column
        gdf = gdf.drop(columns=['coordinates'])
    
    else:
        # Set location for all rows
        df_burn["location"] = 'Mae Suai, Chiang Rai, Thailand'

        # Create a GeoDataFrame
        geometry = [Point(xy) for xy in zip(df_burn['Longitude'], df_burn['Latitude'])]
        gdf = gpd.GeoDataFrame(df_burn, geometry=geometry)

    # Add 'location' to properties attribute
    gdf['properties'] = df_burn["location"]

    # Export the GeoDataFrame as a SHAPE file
    gdf.to_file(shape_full_path, driver='ESRI Shapefile')

def main():

    # Path for CSV import
    data_path = (r'D:\Work\Code งาน\Lab-docker\RIDA\Results\CSV predicted\Mae Suay\Ban Pa Na Mae Suay 2023 Burn_Area_Predictions.csv')

    # Path for export SHAPE and CSV without Geometry
    shape_folder_path = (r'D:\Work\Code งาน\Lab-docker\RIDA\Results\SHAPE File\Mae Suay\Burn\2023')
    shape_file_name = 'Mae Suay 2023 Burn Area Predictions.shp'
    shape_full_path = shape_folder_path + shape_file_name

    # Call Function
    csv_to_shape(data_path, shape_full_path)
    print(gpd.read_file(shape_full_path))

# For running in a script mode
if __name__ == "__main__":
    main()
