import React, { useEffect } from 'react';
import "leaflet/dist/leaflet.css";
import BaseMap from "./layers/BaseMap";
import MapLocation from "./MapLocation";
import MapHotspot from "./MapHotspot";
import MapBurnScar from "./MapBurnScar";
import { MapContainer, useMap } from "react-leaflet";
import { useSelector } from 'react-redux';
import ChangeView from './ChangeView'; // ต้องการ import uiSlice ที่มี saveLayerSettings.fulfilled

// const ChangeView = ({ center, zoom }) => {
//   const map = useMap();
//   useEffect(() => {
//     console.log('change')
//     map.setView(center, zoom);
//   }, [center, zoom, map]);
//   return null;
// }

const MapContent = () => {
  const { burntScar, aqi, hotSpot, current_lat, current_lng } = useSelector(state => state.ui);

  return (
    
      <MapContainer
        style={{ width: "100%", height: 'calc(100vh - 68.5px)', pointerEvents: "auto"  }}
        // center={[13, 100]}
        center={[19.9094, 99.8275]}
        // center={[current_lat, current_lng]}
        // center={[44, -89.5]}
        zoom={8}
        // maxZoom={18}
        // minZoom={5}
      > 
        <ChangeView />
        <BaseMap />
        {burntScar && <MapBurnScar />}
        {aqi && <MapLocation />} 
        {hotSpot && <MapHotspot />} 
      </MapContainer>
    
  );
};

export default MapContent;
