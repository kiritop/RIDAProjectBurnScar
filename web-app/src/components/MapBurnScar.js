import React, { useState, useEffect } from "react";
import {CircleMarker, GeoJSON} from "react-leaflet";
import L from "leaflet"; // import Leaflet library


const MapBurnScar = () => {
  const [firmsData, setFirmsData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        "http://localhost:3000/read-shapefile-half"
      );
      const data = await response.json();
      
      // const geometries = data.map(item => item.geometry);
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

  // define a custom pointToLayer function
  const pointToLayer = (feature, latlng) => {
    // get the color based on the fire type
    const color = getColor(feature.properties.FIRE_TYPE_);
    // create a circle marker with a fixed pixel radius of 1
    return L.circleMarker(latlng, { radius: 0.5, color: color, fillOpacity: 1 });
    // alternatively, you can create a marker with a custom icon
    // return L.marker(latlng, { icon: L.icon({ iconUrl: "some-image-url", iconSize: [10, 10] }) });
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