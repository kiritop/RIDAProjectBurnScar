import React from "react";
import "leaflet/dist/leaflet.css";
import BaseMap from "./layers/BaseMap";
import MapLocation from "./MapLocation";
import MapHotspot from "./MapHotspot";
import MapBurnScar from "./MapBurnScar";
import SideTabs from "./SideTabs";
import FilterOptions from './FilterOptions';

import { MapContainer } from "react-leaflet";

const tabs = [
  { 
    name: 'Filter Options', 
    content: <FilterOptions 
                options={['Option 1', 'Option 2']} 
                onFilterChange={(e) => console.log(e.target.name, e.target.checked)} 
              /> 
  },
  // Add more tabs as needed
];

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
        {/* <MapBurnScar /> */}
        {/* <MapHotspot /> */}
        <MapLocation />
        {/* <SideTabs tabs={tabs} /> */}
      </MapContainer>
    
  );
};

export default MapContent;
