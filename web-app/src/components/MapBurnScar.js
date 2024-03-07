import React, { useState, useEffect } from "react";
import {CircleMarker, GeoJSON} from "react-leaflet";



const MapBurnScar = () => {
  const [firmsData, setFirmsData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        "http://localhost:3000/read-shapefile-half"
      );
      const data = await response.json();
      
      // const geometries = data.map(item => item.geometry);
      console.log(data)
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

// const pointToLayer = (feature, latlng) => {
//   console.log('feature', feature);
//   return (
//     <CircleMarker 
//       center={latlng}
//       radius={1}
//       fillOpacity={1}
//     />
//   );
// }



  return (
    <>
     {/* {
          // Iterate the borderData with .map():
          firmsData.map((data, index) => {
            // Get the layer data from geojson:
            const geojson = data.geometry
            return (
              // Pass data to layer via props:
              <>
                <GeoJSON key={index} data={geojson} />
              </>
            )
          })
        } */}
    {/* <GeoJSON data={firmsData}  pointToLayer={pointToLayer}/> */}
      {firmsData.map((feature, index) => {
        
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
      })}
    </>
  );
};

export default MapBurnScar;