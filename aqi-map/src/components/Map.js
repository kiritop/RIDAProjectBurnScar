import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
const position = [51.505, -0.09]
const Map = ({ aqiData }) => {
  return (
    // <MapContainer center={[13.736717, 100.523186]} zoom={6} style={{ height: '100vh', width: '100%' }}>
    //   <TileLayer
    //     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    //   />
    //   {aqiData && aqiData.map((item, index) => (
    //     <Marker key={index} position={[item.lat, item.lng]}>
    //       <Popup>
    //         <div>
    //           <h2>{item.location}</h2>
    //           <p>AQI: {item.aqi}</p>
    //         </div>
    //       </Popup>
    //     </Marker>
    //   ))}
    // </MapContainer>
    <MapContainer center={position} zoom={13} scrollWheelZoom={false}>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    {/* <Marker position={position}>
      <Popup>
        A pretty CSS3 popup. <br /> Easily customizable.
      </Popup>
    </Marker> */}
  </MapContainer>
  );
}

export default Map;