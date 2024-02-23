import React, { useState, useEffect } from "react";
import {Marker, Popup, CircleMarker  } from "react-leaflet";
import Papa from 'papaparse';


const MapHotspot = () => {
  const [firmsData, setFirmsData] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       const response = await fetch(
//         "https://firms.modaps.eosdis.nasa.gov/api/area/csv/579db9c41c852c1f75bc6b73f8b90262/MODIS_NRT/world/1/2024-02-23"
//       );
//       const data = await response.json();
//       console.log(data)
//       setFirmsData(data.features);
//     };
//     fetchData();
//   }, []);

  useEffect(() => {
    // Fetch the CSV data from the API URL
    fetch('https://firms.modaps.eosdis.nasa.gov/api/area/csv/579db9c41c852c1f75bc6b73f8b90262/MODIS_NRT/world/1/2024-02-23')
      .then((response) => response.text())
      .then((csvData) => {
        // Parse the CSV data
        Papa.parse(csvData, {
          header: true, // Assumes the first row contains column headers
          complete: (result) => {
            console.log(result)
            setFirmsData(result.data); // Set the JSON data
          },
        });
      });
  }, []);

  return (
    <>
      {firmsData.map((feature, index) => {
        
        // const { latitude, longitude } = feature.geometry.coordinates;
        return (
            <CircleMarker 
                key={index} 
                center={[feature?.latitude, feature?.longitude]}
                radius={1}
                color="red"
                fillOpacity={0.8}
            >
          </CircleMarker>
        );
      })}
    </>
  );
};

export default MapHotspot;