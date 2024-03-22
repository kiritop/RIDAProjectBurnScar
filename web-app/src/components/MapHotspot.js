import React, { useEffect } from "react";
import {CircleMarker} from "react-leaflet";
import { useDispatch, useSelector } from 'react-redux';
import { fetchHotSpotData } from '../reducers/hotSpotSlice';
import { setLoadingMap } from '../reducers/uiSlice';

const MapHotspot = () => {
  const hotSpotData = useSelector(state => state.hotSpot.data);
  const dispatch = useDispatch();


  useEffect(() => {
    dispatch(setLoadingMap(true));
    dispatch(fetchHotSpotData())
    .finally(() => {
      dispatch(setLoadingMap(false));
    });
    
  }, [dispatch]);

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