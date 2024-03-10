import React, { useState, useEffect } from "react";
import {CircleMarker, GeoJSON, Popup} from "react-leaflet";
import L from "leaflet"; // import Leaflet library
import axios from 'axios';



const MapBurnScar = () => {
  const [firmsData, setFirmsData] = useState([]);
  const [maxPercent, setMaxPercent] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        "http://localhost:3000/process-shapefiles"
      );
      const data = await response.json();
      let max = data.reduce((max, obj) => Math.max(max, obj.properties.count), -Infinity);
      console.log("max =", max);
      // const geometries = data.map(item => item.geometry);
      setMaxPercent(max)
      setFirmsData(data);
    };
    fetchData();
  }, []);

  const getColor = (fireType) => {
    switch(fireType) {
        case 1: //Wildfire':1
            return "red";
        case 2://Prescribed Fire
            return "orange";
        case 3://Unknown
            return "yellow";
        default://Wildland Fire Use
            return "blue";
    }
}


const calculatePercentage = (value) => {
  return (value / maxPercent) * 100;
}



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

  console.log('value =', value);
  console.log('hex =', rgbToHex(red, green, blue));

  return rgbToHex(red, green, blue); // Only green component changes
};

  // define a custom pointToLayer function
  const pointToLayer = (feature, latlng) => {
    // get the color based on the fire type
    const color = percentToColor(feature.properties.frequency);
    // create a circle marker with a fixed pixel radius of 1
    // return L.circleMarker(latlng, { radius: 1, color: color, fillOpacity: 1 });
    let marker = L.circleMarker(latlng, { radius: 1, color: color, fillOpacity: 1 });
    // marker.bindPopup("Burnt Frequency = "+ feature.properties.count +" times / :" + calculatePercentage(feature.properties.count)+" %");
    //create key from latlong
    // const keyLatLng = feature.geometry.coordinates.join(',');
    // const marker = <CircleMarker 
    //                     key={keyLatLng} 
    //                     center={latlng}
    //                     radius={1}
    //                     color={color}
    //                     fillOpacity={1}
    //                 />;
    const years = feature.properties.year;
    console.log('years', years)
    let yearString = '';
    for (let i = 0; i < years.length; i++) {
      yearString += `<p>Year: ${years[i]}</p>`;
    }
    marker.on('click', () => {
      getReverseGeocodingData(latlng.lat, latlng.lng)
        .then(address => {
          marker.bindPopup(`
                        <div style="font-family: Arial, sans-serif; padding: 10px; border-radius: 5px;">
                          <h2 style="margin: 0;">Place: ${address.display_name}</h2>
                          <p style="margin: 5px 0;">Latitude: ${feature.geometry.coordinates[1]}</p>
                          <p style="margin: 5px 0;">Longitude: ${feature.geometry.coordinates[0]}</p>
                          <p style="margin: 5px 0;">Percent of burn: ${feature.properties.frequency} % </p>
                          <p style="margin: 5px 0;">Burnt scar frequency (times): ${feature.properties.count}</p>
                          ${years.map(year => `<p style="margin: 5px 0;">Year of burn occur: ${year}</p>`).join('')}

                        </div>
                      `);
        })
        .catch(error => {
          console.error('Error fetching address', error);
        });
    });
    
    return marker;
    // alternatively, you can create a marker with a custom icon
    // return L.marker(latlng, { icon: L.icon({ iconUrl: "some-image-url", iconSize: [10, 10] }) });
  };

  const getReverseGeocodingData = async (lat, lon) => {
    const apiKey = '65eddfd7b586a527220428jro7f022f'; // แทนที่ 'your_api_key' ด้วย API key ของคุณ
    const url = `https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}&api_key=${apiKey}`;

    try {
      const response = await axios.get(url);
      return response.data; // ข้อมูลที่อยู่จะอยู่ใน response.data
    } catch (error) {
      console.error('Error fetching reverse geocoding data', error);
    }
  };



  return (
    <>
     {
          // Iterate the borderData with .map():
          firmsData.map((data, index) => {

            return (
              // Pass data to layer via props:
              <>
                <GeoJSON key={index} data={data} pointToLayer={pointToLayer} />
              </>
            )
          })
      }
      {/* {firmsData.map((feature, index) => {
        
        // const { latitude, longitude } = feature.geometry.coordinates;
        const position = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
        const color = getColor(feature.properties.FIRE_TYPE_);
        return (
            <CircleMarker 
                key={index} 
                center={position}
                radius={1}
                color={color}
                fillOpacity={1}
            >
          </CircleMarker>
        );
      })} */}
    </>
  );
};

export default MapBurnScar;