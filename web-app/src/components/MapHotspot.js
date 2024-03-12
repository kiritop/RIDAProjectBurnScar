import React, { useState, useEffect } from "react";
import {CircleMarker} from "react-leaflet";
import Papa from 'papaparse';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHotSpotData } from '../reducers/hotSpotSlice';

const MapHotspot = () => {
  const hotSpotData = useSelector(state => state.hotSpot.data);
  const loading = useSelector(state => state.hotSpot.loading); 
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchHotSpotData());
  }, [dispatch]);

  
  if (loading) {
    return <div>Loading...</div>; // แสดง loader ถ้าข้อมูล AQI กำลังโหลด
  }


  return (
    <>
      {hotSpotData.map((feature, index) => {
        
        // const { latitude, longitude } = feature.geometry.coordinates;
        return (
            <CircleMarker 
                key={index} 
                center={[feature?.latitude, feature?.longitude]}
                radius={1}
                color="red"
                fillOpacity={0.8}
            >
          </CircleMarker>
        );
      })}
    </>
  );
};

export default MapHotspot;