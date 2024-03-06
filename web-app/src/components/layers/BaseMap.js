import React from "react";
import { LayersControl, TileLayer } from "react-leaflet";

const BaseMap = () => {
  return (
    <LayersControl position="topright">
      <LayersControl.BaseLayer name="Open Street Map">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      </LayersControl.BaseLayer>

      <LayersControl.BaseLayer name="Open Street Map (Cyclosm)">
        <TileLayer url=" https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png" />
      </LayersControl.BaseLayer>

      <LayersControl.BaseLayer name="Arc GIS">
        <TileLayer
          attribution="Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community"
          className="basemap"
          maxNativeZoom={19}
          maxZoom={19}
          subdomains={["clarity"]}
          url="https://{s}.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
      </LayersControl.BaseLayer>

      
      <LayersControl.BaseLayer name="Stadia Maps Dark" checked>
        <TileLayer
          attribution='<a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          className="basemap"
          // maxNativeZoom={19}
          // maxZoom={19}
          ext='png'
          subdomains={["clarity"]}
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}"
        />
      </LayersControl.BaseLayer>
     
    </LayersControl>
  );
};

export default BaseMap;
