import React, { useState, useEffect } from "react";
import {CircleMarker, GeoJSON, Popup} from "react-leaflet";
import L from "leaflet"; // import Leaflet library
import './custom.css';



const MapBurnScar = () => {
  const [firmsData, setFirmsData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        "http://localhost:3000/process-shapefiles"
      );
      const data = await response.json();
      setFirmsData(data);
    };
    fetchData();
  }, []);

const percentToColor = (percent) => {
  const value = percent / 100;
  const red = Math.round(255);
  const green = Math.round(255 * (1 - value));
  const blue = 0;

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');

  return rgbToHex(red, green, blue); // Only green component changes
};

  // define a custom pointToLayer function
  const pointToLayer = (feature, latlng) => {
    // get the color based on the fire type
    const color = percentToColor(feature.properties.frequency);
    // create a circle marker with a fixed pixel radius of 1
    let marker = L.circleMarker(latlng, { radius: 1, color: color, fillOpacity: 1 });

    
    
    return marker;
  };

  // const getReverseGeocodingData = async (lat, lon) => {
  //   const apiKey = '65eddfd7b586a527220428jro7f022f'; // แทนที่ 'your_api_key' ด้วย API key ของคุณ
  //   const url = `https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}&api_key=${apiKey}`;

  //   try {
  //     const response = await axios.get(url);
  //     return response.data; // ข้อมูลที่อยู่จะอยู่ใน response.data
  //   } catch (error) {
  //     console.error('Error fetching reverse geocoding data', error);
  //   }
  // };

  const onEachFeature = (feature, layer) => {
    // create a popup with the feature's properties
    let popupContent = ` <div style="font-family: Arial, sans-serif; padding: 10px; border-radius: 5px;">
      <h4 style="text-align: center">Chiang Rai, Thailand</h4>
      <table>
        <tr><td><strong>Latitude:</strong></td><td style="text-align:right">${feature.geometry.coordinates[1]}</td></tr>
        <tr><td><strong>Longitude:</strong></td><td style="text-align:right">${feature.geometry.coordinates[0]}</td></tr>
        <tr><td><strong>Burnt ratio :</strong></td><td style="background-color:${percentToColor(feature.properties.frequency)};text-align:right;color:#000000;">${feature.properties.frequency} % </td></tr>
        <tr><td><strong>Burnt frequency (times) :</strong></td><td style="text-align:right">${feature.properties.count}</td></tr>
        ${feature.properties.year.map(item => `<tr><td><strong>Year of burned :</strong></td> <td style="text-align:right">${item}</td></tr>`).join('')}
      </table>
    </div>`;
    layer.bindPopup(popupContent, { className: 'custom-popup' }); // add a custom class name
  };


  return (
    <>
     {
          // Iterate the borderData with .map():
          firmsData.map((data, index) => {

            return (
              // Pass data to layer via props:
              <>
                <GeoJSON key={index} data={data} pointToLayer={pointToLayer} onEachFeature={onEachFeature} />
              </>
            )
          })
      }
      
    </>
  );
};

export default MapBurnScar;