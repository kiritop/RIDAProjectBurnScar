import React, { useState } from 'react';
import "leaflet/dist/leaflet.css";
import BaseMap from "./layers/BaseMap";
import MapLocation from "./MapLocation";
import MapHotspot from "./MapHotspot";
import MapBurnScar from "./MapBurnScar";
import SideTabs from "./SideTabs";
import FilterOptions from './FilterOptions';
import { MapContainer } from "react-leaflet";
import Sidebar from "../layout/Sidebar";
import ToggleButton from './ToggleButton';

const MapContent = () => {
  return (
    
      <MapContainer
        style={{ width: "100%", height: 'calc(100vh - 64px)', pointerEvents: "auto"  }}
        center={[13, 100]}
        zoom={6}
        maxZoom={18}
        minZoom={5}
      >
        <BaseMap />
        {/* <ToggleButton isOpen={isOpen} toggleDrawer={toggleDrawer} /> */}
        {/* <MapBurnScar /> */}
        {/* <MapHotspot /> */}
        {/* <MapLocation /> */}
        {/* <SideTabs tabs={tabs} /> */}
        {/* <Sidebar isOpen={isOpen} /> */}
      </MapContainer>
    
  );
};

export default MapContent;
