import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Typography } from '@mui/material';

const BubbleMapBurntScar = ({ burntAreas, center, zoom }) => {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {burntAreas.map((area, index) => (
        <CircleMarker
          key={index}
          center={area.position}
          radius={area.radius}
          color="red"
          fillColor="#f03"
          fillOpacity={0.5}
        >
          <Popup>
            <Typography variant="subtitle1">
              {area.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Burnt Area: {new Intl.NumberFormat('en-US').format(area.area)} sq m
            </Typography>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

export default BubbleMapBurntScar;