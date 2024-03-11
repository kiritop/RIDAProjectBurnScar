import React from 'react';
import "leaflet/dist/leaflet.css";
import BaseMap from "./layers/BaseMap";
import MapLocation from "./MapLocation";
import MapHotspot from "./MapHotspot";
import MapBurnScar from "./MapBurnScar";
import { MapContainer } from "react-leaflet";


const MapContent = () => {
  return (
    
      <MapContainer
        style={{ width: "100%", height: 'calc(100vh - 48px)', pointerEvents: "auto"  }}
        // center={[13, 100]}
        center={[19.9094, 99.8275]}
        // center={[44, -89.5]}
        zoom={10}
        // maxZoom={18}
        // minZoom={5}
      >
        <BaseMap />
        {/* <MapBurnScar /> */}
        {/* <MapHotspot /> */}
        {/* <MapLocation /> */}
      </MapContainer>
    
  );
};

export default MapContent;
