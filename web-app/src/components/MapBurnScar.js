import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet"; // import Leaflet library
import './custom.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBurntScarPolygon, getMax } from '../reducers/burntScarSlice';
import { setLoadingMap } from '../reducers/uiSlice';
import { getColorByFrequency } from '../utils/colorUtils'; // Import the utility function

const MapBurnScar = () => {
  const dispatch = useDispatch();
  const burntScarData = useSelector(state => state.burnScar.data);
  const max_freq = useSelector(state => state.burnScar.max);
  const sidebarForm = useSelector(state => state.ui.sidebarForm);
  const map = useMap();

  useEffect(() => {
    dispatch(setLoadingMap(true));

    let layersAdded = 0;

    burntScarData.forEach((data) => {
      const geoJsonLayer = L.geoJSON(data, {
        style: feature => style(feature),
        coordsToLatLng: coords => new L.LatLng(coords[1], coords[0]),
        onEachFeature: onEachFeature
      }).addTo(map);

      geoJsonLayer.on('add', () => {
        layersAdded++;
        if (layersAdded === burntScarData.length) {
          dispatch(setLoadingMap(false));
        }
      });
    });
  }, [dispatch, sidebarForm, burntScarData, map]);

  const style = (feature) => {
    const frequency_times = feature.properties.frequency_times;
    return {
      color: getColorByFrequency(frequency_times, max_freq),
      weight: 0.5,
      fillOpacity: 0.7
    };
  };

  const onEachFeature = (feature, layer) => {
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'short', day: '2-digit' };
      return date.toLocaleDateString('en-US', options);
    };

    let frequencyDates = feature.properties.FREQUENCY_DATE ? feature.properties.FREQUENCY_DATE.split(',') : [feature.properties.FIRE_DATE];
    const formattedFrequencyDates = frequencyDates.map(formatDate).join('<br>');
    const times = frequencyDates.length;
    const formattedArea = `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feature.properties.AREA)} sq m`;

    let popupContent = ` <div style="font-family: Arial, sans-serif; padding: 10px; border-radius: 5px;">
      <h4 style="text-align: center">${feature?.properties?.AP_EN} ${feature?.properties?.PV_EN}, ${feature?.properties?.COUNTRY}</h4>
      <table>
        <tr><td><strong>Latitude:</strong></td><td style="text-align:right">${feature.properties.LATITUDE}</td></tr>
        <tr><td><strong>Longitude:</strong></td><td style="text-align:right">${feature.properties.LONGITUDE}</td></tr>
        <tr><td><strong>Burnt frequency (time/max) :</strong></td><td style="text-align:right">${times}/${max_freq}</td></tr>
        <tr><td><strong>Burnt date :</strong></td><td style="text-align:right">${formattedFrequencyDates}</td></tr>
        <tr><td><strong>Area M :</strong></td><td style="text-align:right">${formattedArea}</td></tr>
      </table>
    </div>`;

    layer.bindPopup(popupContent, { className: 'custom-popup' });
  };

  return null; // No need to return JSX as layers are directly added to the map
};

export default MapBurnScar;
