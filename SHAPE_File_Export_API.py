from flask import Flask, jsonify, request, make_response
from flask_sqlalchemy import SQLAlchemy
import geopandas as gpd
from shapely.geometry import Polygon
from sqlalchemy import text
from datetime import datetime
from io import BytesIO
import tempfile
import shutil
import os
import zipfile

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:gdkll,%40MFU2024@10.1.29.33:3306/RidaDB'
db = SQLAlchemy(app)

@app.route('/export', methods=['GET'])
def export_to_shapefile():
    # Get parameters from the request
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    country = request.args.get('country')
    province = request.args.get('province')

    # Validate parameters
    required_params = [start_date, end_date, country, province]
    if not all(required_params):
        return jsonify({"error": "Missing required parameters"}), 400

    # Convert start_date and end_date to datetime.date objects
    try:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Please provide dates in YYYY-MM-DD format."}), 400

    # Define the filename based on parameters
    folder_name = f"{country}_{province}_{start_date}_{end_date}_SHAPE"
    filename = f"{folder_name}.zip"

    # Define the query
    query = text("""
        SELECT AP_EN, PV_EN, FIRE_DATE, AREA, COUNTRY, LATITUDE, LONGITUDE, GEOMETRY_DATA, GEOMETRY_TYPE
        FROM BURNT_SCAR_INFO
        WHERE FIRE_DATE BETWEEN :start_date AND :end_date
          AND COUNTRY = :country
          AND PV_EN = :province
    """)

    # Execute the query
    with db.engine.connect() as connection:
        result = connection.execute(query, {
            'start_date': start_date,
            'end_date': end_date,
            'country': country,
            'province': province
        })

        # Fetch data and create list of dictionaries
        data = []
        for row in result.fetchall():
            # Convert GEOMETRY_DATA from string to list of coordinates
            coordinates = eval(row[7])  # Assuming GEOMETRY_DATA is a string representation of a list of coordinates

            # Construct Polygon geometry directly from the list of coordinates
            polygon = Polygon(coordinates)

            row_dict = {
                'AP_EN': row[0],
                'PV_EN': row[1],
                'FIRE_DATE': row[2].strftime('%Y-%m-%d'),  # Convert datetime.date to string
                'AREA': float(row[3]),  # Convert Decimal to float
                'COUNTRY': row[4],
                'LATITUDE': float(row[5]),  # Convert Decimal to float
                'LONGITUDE': float(row[6]),  # Convert Decimal to float
                'GEOMETRY_TYPE': row[8],
                'geometry': polygon
            }
            data.append(row_dict)

        # Create a GeoDataFrame
        gdf = gpd.GeoDataFrame(data, geometry='geometry', crs="EPSG:4326")

        # Create a temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create a subdirectory for the shapefile
            shapefile_dir = os.path.join(temp_dir, folder_name)
            os.makedirs(shapefile_dir)

            # Write the shapefile files to the subdirectory with custom file names
            file_paths = gdf.to_file(shapefile_dir, driver='ESRI Shapefile')
            if file_paths is not None:
                for ext in ['.shp', '.shx', '.dbf', '.prj']:
                    src_path = file_paths[:-4] + ext
                    dst_path = os.path.join(shapefile_dir, f"{folder_name}{ext}")
                    os.rename(src_path, dst_path)

            # Create a ZIP file in memory
            zip_buffer = BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
                # Recursively add the shapefile directory to the ZIP file
                for root, dirs, files in os.walk(shapefile_dir):
                    for file_name in files:
                        file_path = os.path.join(root, file_name)
                        zip_file.write(file_path, os.path.relpath(file_path, temp_dir))

            # Reset the ZIP file pointer to the beginning
            zip_buffer.seek(0)

            # Create the response with the ZIP file content
            response = make_response(zip_buffer.read())
            response.headers.set('Content-Type', 'application/zip')
            response.headers.set('Content-Disposition', 'attachment; filename=' + filename)

        return response

if __name__ == '__main__':
    app.run(debug=True)