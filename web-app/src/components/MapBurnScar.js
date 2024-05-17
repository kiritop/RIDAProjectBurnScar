import React, { useEffect } from "react";
import {GeoJSON} from "react-leaflet";
import L from "leaflet"; // import Leaflet library
import './custom.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBurntScarPolygon } from '../reducers/burntScarSlice';
import { setLoadingMap } from '../reducers/uiSlice';



const MapBurnScar = () => {
  const dispatch = useDispatch();
  const burntScarData = useSelector(state => state.burnScar.data);
  // const loading = useSelector(state => state.burnScar.loading); 
  const sidebarForm = useSelector(state => state.ui.sidebarForm);

  useEffect(() => {
    dispatch(setLoadingMap(true));
    dispatch(fetchBurntScarPolygon(sidebarForm))
    .finally(() => {
      dispatch(setLoadingMap(false));
    });
    
  }, [dispatch, sidebarForm]);

const percentToColor = (percent) => {
  const value = percent / 100;
  const red = Math.round(255);
  const green = Math.round(255 * (1 - value));
  const blue = 0;

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');

  return rgbToHex(red, green, blue); // Only green component changes
};

  // define a custom pointToLayer function
  const polygonToLayer = (feature, latlngs) => {
    console.log("feature", feature)
    // get the color based on the fire type
    // const color = percentToColor(feature.properties.frequency);
    // create a polygon marker
    let marker = L.polygon(latlngs, { color: 'red', fillOpacity: 1 });

    return marker;
  };

  // const getReverseGeocodingData = async (lat, lon) => {
  //   const apiKey = '65eddfd7b586a527220428jro7f022f'; // แทนที่ 'your_api_key' ด้วย API key ของคุณ
  //   const url = `https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}&api_key=${apiKey}`;

  //   try {
  //     const response = await axios.get(url);
  //     return response.data; // ข้อมูลที่อยู่จะอยู่ใน response.data
  //   } catch (error) {
  //     console.error('Error fetching reverse geocoding data', error);
  //   }
  // };

  const onEachFeature = (feature, layer) => {
    // create a popup with the feature's properties
    // let popupContent = ` <div style="font-family: Arial, sans-serif; padding: 10px; border-radius: 5px;">
    //   <h4 style="text-align: center">${feature?.properties?.location}</h4>
    //   <table>
    //     <tr><td><strong>Latitude:</strong></td><td style="text-align:right">${feature.geometry.coordinates[1]}</td></tr>
    //     <tr><td><strong>Longitude:</strong></td><td style="text-align:right">${feature.geometry.coordinates[0]}</td></tr>
    //     <tr><td><strong>Burnt ratio :</strong></td><td style="background-color:${percentToColor(feature.properties.frequency)};text-align:right;color:#000000;">${feature.properties.frequency} % </td></tr>
    //     <tr><td><strong>Burnt frequency (times / total) :</strong></td><td style="text-align:right">${feature.properties.count}/${feature.properties.total_shapefile}</td></tr>
    //     <tr><td><strong>Burnt year :</strong></td><td style="text-align:right">${feature.properties.year}</td></tr>
    //   </table>
    // </div>`;
    // // ${feature.properties.year.map(item => `<tr><td><strong>Burnt year :</strong></td> <td style="text-align:right">${item}</td></tr>`).join('')}
    // layer.bindPopup(popupContent, { className: 'custom-popup' }); // add a custom class name
  };


  return (
    <>
     {
          // Iterate the borderData with .map():
          burntScarData.map((data, index) => {
            // Convert the coordinates to a format that can be used by Leaflet
            // Convert the coordinates to a format that can be used by Leaflet
            const coordinates = data.geometry.coordinates.map(coordinate => [coordinate[1], coordinate[0]]);

          return (
            // Pass data to layer via props:
            <GeoJSON key={index} data={{...data, geometry: {...data.geometry, coordinates: [coordinates]}}} style={{color: 'red', weight: 1, fillOpacity: 0.5}} coordsToLatLng={coords => new L.LatLng(coords[0], coords[1])} onEachFeature={onEachFeature} />
            )
          })
      }
      
    </>
  );
};

export default MapBurnScar;