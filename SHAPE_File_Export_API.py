from flask import Flask, jsonify, request, send_file, make_response
from flask_sqlalchemy import SQLAlchemy
import geopandas as gpd
from shapely.geometry import Polygon
from sqlalchemy import text
from datetime import datetime
from io import BytesIO

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
    filename = f"{country}_{province}_{start_date}_{end_date}_SHAPE.zip"

    # Define the query
    query = text("""
        SELECT BURNT_SCAR_ID, AP_EN, PV_EN, FIRE_DATE, AREA, COUNTRY, LATITUDE, LONGITUDE, GEOMETRY_DATA, GEOMETRY_TYPE
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
            coordinates = eval(row[8])  # Assuming GEOMETRY_DATA is a string representation of a list of coordinates

            # Construct Polygon geometry directly from the list of coordinates
            polygon = Polygon(coordinates)
            
            row_dict = {
                'BURNT_SCAR_ID': int(row[0]),  # Convert Decimal to int
                'AP_EN': row[1],
                'PV_EN': row[2],
                'FIRE_DATE': row[3].strftime('%Y-%m-%d'),  # Convert datetime.date to string
                'AREA': float(row[4]),  # Convert Decimal to float
                'COUNTRY': row[5],
                'LATITUDE': float(row[6]),  # Convert Decimal to float
                'LONGITUDE': float(row[7]),  # Convert Decimal to float
                'GEOMETRY_TYPE': row[9],
                'geometry': polygon
            }
            data.append(row_dict)

        # Create a GeoDataFrame
        gdf = gpd.GeoDataFrame(data, geometry='geometry', crs="EPSG:4326")

        # Export to shapefile in memory
        with BytesIO() as buffer:
            gdf.to_file(buffer, driver='ESRI Shapefile')
            buffer.seek(0)
            response = make_response(buffer.read())
            response.headers.set('Content-Type', 'application/zip')
            response.headers.set('Content-Disposition', 'attachment; filename=' + filename)
            return response

if __name__ == '__main__':
    app.run(debug=True)
