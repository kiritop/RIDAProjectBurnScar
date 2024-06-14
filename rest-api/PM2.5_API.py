import requests
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# Database connection string
connection_string = 'mysql+pymysql://root:gdkll,%40MFU2024@localhost:3306/RidaDB'
engine = create_engine(connection_string)

# Function to fetch PM2.5 data from OpenWeatherMap API
def fetch_pm25(lat, lon, api_key):
    url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={api_key}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        pm25 = data['list'][0]['components']['pm2_5']
        return pm25
    else:
        raise Exception(f"API request failed with status code: {response.status_code}, response: {response.text}")

# API Key for OpenWeatherMap
api_key = '5a1769acb09ddf5b52151ca2bc9c6292'  # Ensure this key is correct

# Generate dates from 2020-02-08 to today
start_date = datetime(2020, 2, 8)
end_date = datetime.now()
date_range = [start_date + timedelta(days=x) for x in range((end_date - start_date).days + 1)]

try:
    with engine.connect() as connection:
        for date in date_range:
            print(f"Processing date: {date}")

            # Get data for the current date, ensuring no NULL values in required fields
            result = connection.execute(text("""
                SELECT LATITUDE, LONGITUDE, AP_EN, PV_EN, COUNTRY, ISO3
                FROM LOCATION_INFO
                WHERE LATITUDE IS NOT NULL
                AND LONGITUDE IS NOT NULL
                AND AP_EN IS NOT NULL
                AND PV_EN IS NOT NULL
                AND COUNTRY IS NOT NULL
                AND ISO3 IS NOT NULL
            """))

            coordinates_list = result.fetchall()

            for row in coordinates_list:
                latitude, longitude, ap_en, pv_en, country, iso3 = row

                try:
                    # Check if data already exists for the current date and coordinates in the AIR_QUALITY table
                    existing_data = connection.execute(text("""
                        SELECT 1
                        FROM AIR_QUALITY
                        WHERE LATITUDE = :latitude
                        AND LONGITUDE = :longitude
                        AND AQI_DATE = :aqi_date
                    """), {'latitude': latitude, 'longitude': longitude, 'aqi_date': date}).fetchone()

                    if existing_data:
                        print(f"Data already exists for LAT: {latitude}, LON: {longitude}, DATE: {date}")
                        continue

                    # Fetch PM2.5 data
                    pm25 = fetch_pm25(latitude, longitude, api_key)

                    # Prepare data for insertion into AIR_QUALITY table
                    data = {
                        'LATITUDE': latitude,
                        'LONGITUDE': longitude,
                        'AP_EN': ap_en,
                        'PV_EN': pv_en,
                        'COUNTRY': country,
                        'ISO3': iso3,
                        'PM25': pm25,
                        'AQI_DATE': date
                    }

                    # Show data before insertion
                    print(f"Data to be inserted: {data}")

                    # Insert data into AIR_QUALITY table within a transaction
                    connection.execute(text("""
                        INSERT INTO AIR_QUALITY (LATITUDE, LONGITUDE, AP_EN, PV_EN, COUNTRY, ISO3, PM25, AQI_DATE)
                        VALUES (:LATITUDE, :LONGITUDE, :AP_EN, :PV_EN, :COUNTRY, :ISO3, :PM25, :AQI_DATE)
                    """), data)
                    connection.commit()

                except Exception as fetch_insert_error:
                    print(f"Failed to fetch or insert data for LAT: {latitude}, LON: {longitude}, Error: {fetch_insert_error}")
                    continue

except SQLAlchemyError as db_error:
    print(f"Database operation failed: {db_error}")
