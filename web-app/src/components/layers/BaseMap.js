import React from "react";
import { LayersControl, TileLayer } from "react-leaflet";

const BaseMap = () => {
  return (
    <LayersControl position="topright">
      <LayersControl.BaseLayer name="Style 1" checked>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      </LayersControl.BaseLayer>

      <LayersControl.BaseLayer name="Style 2">
        <TileLayer url=" https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png" />
      </LayersControl.BaseLayer>
    </LayersControl>
  );
};

export default BaseMap;
