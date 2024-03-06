import React from "react";
import { LayersControl, TileLayer } from "react-leaflet";

const BaseMap = () => {
  return (
    <LayersControl position="topright">
      <LayersControl.BaseLayer name="Open Street Map">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      </LayersControl.BaseLayer>

      {/* <LayersControl.BaseLayer name="Open Street Map (Cyclosm)">
        <TileLayer url=" https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png" />
      </LayersControl.BaseLayer> */}

      <LayersControl.BaseLayer name="Arc GIS" checked>
        <TileLayer
          attribution="Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community"
          className="basemap"
          maxNativeZoom={19}
          maxZoom={19}
          subdomains={["clarity"]}
          url="https://{s}.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
      </LayersControl.BaseLayer>

     
     
    </LayersControl>
  );
};

export default BaseMap;
