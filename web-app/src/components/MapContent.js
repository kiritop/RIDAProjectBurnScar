import React from 'react';
import "leaflet/dist/leaflet.css";
import BaseMap from "./layers/BaseMap";
import MapLocation from "./MapLocation";
import MapHotspot from "./MapHotspot";
import MapBurnScar from "./MapBurnScar";
import MapBurnScarPoint from "./MapBurnScarPoint";
import { MapContainer } from "react-leaflet";
import { useSelector } from 'react-redux';
import ChangeView from './ChangeView'; // ต้องการ import uiSlice ที่มี saveLayerSettings.fulfilled


const MapContent = () => {
  const { burntScar, aqi, hotSpot, burntScarPoint } = useSelector(state => state.ui);

  return (
    
      <MapContainer
        style={{ width: "100%", height: 'calc(100vh - 68.5px)', pointerEvents: "auto"  }}
        // center={[13, 100]}
        center={[19.9094, 99.8275]}
        // center={[44, -89.5]}
        zoom={8}
        preferCanvas={true}
        // maxZoom={18}
        // minZoom={5}
      > 
        <ChangeView />
        <BaseMap />
        {burntScar && <MapBurnScar />}
        {burntScarPoint && <MapBurnScarPoint />}
        {aqi && <MapLocation />} 
        {hotSpot && <MapHotspot />} 
      </MapContainer>
    
  );
};

export default MapContent;
