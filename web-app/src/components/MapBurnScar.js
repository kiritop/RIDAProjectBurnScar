import React, { useEffect } from "react";
import { GeoJSON, useMapEvents } from "react-leaflet";
import L from "leaflet"; // import Leaflet library
import './custom.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBurntScarPolygon, getMax } from '../reducers/burntScarSlice';
import { setLoadingMap } from '../reducers/uiSlice';

const colorIntensityArray = [
  { fillOpacity: 0.2, color: '#FFCCCC' },
  { fillOpacity: 0.3, color: '#FFB2B2' },
  { fillOpacity: 0.4, color: '#FF9999' },
  { fillOpacity: 0.5, color: '#FF7F7F' },
  { fillOpacity: 0.6, color: '#FF6666' },
  { fillOpacity: 0.7, color: '#FF4C4C' },
  { fillOpacity: 0.8, color: '#FF3232' },
  { fillOpacity: 0.9, color: '#FF1919' },
  { fillOpacity: 1.0, color: '#FF0000' }
];

const MapBurnScar = () => {
  const dispatch = useDispatch();
  const burntScarData = useSelector(state => state.burnScar.data);
  const max_freq = useSelector(state => state.burnScar.max);
  const sidebarForm = useSelector(state => state.ui.sidebarForm);

  useEffect(() => {
    dispatch(setLoadingMap(true));
    // dispatch(getMax(sidebarForm)).finally(() => {
    //   dispatch(fetchBurntScarPolygon(sidebarForm)).finally(() => {
    //     // Remove this call here, as it will be handled after rendering
    //     // dispatch(setLoadingMap(false));
    //   });
    // });
  }, [dispatch, sidebarForm]);

  useMapEvents({
    layeradd: () => {
      dispatch(setLoadingMap(false));
    }
  });

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

  const style = (feature, index) => {
    // Calculate fillOpacity based on some property of feature
    const fillOpacity = max_freq === 1 ? 0.5 : 1 / max_freq;
    const color = colorIntensityArray[index % colorIntensityArray.length].color; // Use the colorIntensityArray

    return {
      color: color,
      weight: 0,
      fillOpacity: fillOpacity
    };
  };

  const onEachFeature = (feature, layer) => {
    // Function to format date to MM DD YYYY
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'short', day: '2-digit' };
      return date.toLocaleDateString('en-US', options);
    };

    // Format the FIRE_DATE
    const formattedDate = formatDate(feature.properties.FIRE_DATE);
    // Format the AREA property with thousand separators and two decimal places
    const formattedArea = `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feature.properties.AREA)} sq m`;

    // create a popup with the feature's properties
    let popupContent = ` <div style="font-family: Arial, sans-serif; padding: 10px; border-radius: 5px;">
      <h4 style="text-align: center">${feature?.properties?.AP_EN} ${feature?.properties?.PV_EN}, ${feature?.properties?.COUNTRY}</h4>
      <table>
        <tr><td><strong>Latitude:</strong></td><td style="text-align:right">${feature.properties.LATITUDE}</td></tr>
        <tr><td><strong>Longitude:</strong></td><td style="text-align:right">${feature.properties.LONGITUDE}</td></tr>
        <tr><td><strong>Burnt date :</strong></td><td style="text-align:right">${formattedDate}</td></tr>
        <tr><td><strong>Area M :</strong></td><td style="text-align:right">${formattedArea}</td></tr>
      </table>
    </div>`;

    layer.bindPopup(popupContent, { className: 'custom-popup' });
  };

  return (
    <>
      {
        burntScarData.map((data, index) => {
          return (
            <GeoJSON
              key={index}
              data={data}
              style={(feature) => style(feature, index)} // Pass index to style function
              coordsToLatLng={coords => new L.LatLng(coords[1], coords[0])}
              onEachFeature={onEachFeature}
            />
          )
        })
      }
    </>
  );
};

export default MapBurnScar;