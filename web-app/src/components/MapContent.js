import React from "react";
import "leaflet/dist/leaflet.css";
import BaseMap from "./layers/BaseMap";
import MapLocation from "./MapLocation";

import { MapContainer } from "react-leaflet";

const MapContent = () => {

  return (
    <div>
      <MapContainer
        style={{ width: "100%", height: "100vh" }}
        center={[13, 100]}
       
        zoom={6}
        maxZoom={18}
        minZoom={5}
      >
        <BaseMap />
        <MapLocation />
      </MapContainer>
    </div>
  );
};

export default MapContent;
