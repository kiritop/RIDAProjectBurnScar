import React, { useEffect } from "react";
import {CircleMarker} from "react-leaflet";
import { useDispatch, useSelector } from 'react-redux';
import { fetchHotSpot } from '../reducers/hotSpotSlice';
import { setLoadingMap } from '../reducers/uiSlice';

const MapHotspot = () => {
  const hotSpotData = useSelector(state => state.hotSpot.dataHotSpot);
  const dispatch = useDispatch();
  const sidebarForm = useSelector(state => state.ui.sidebarForm);


  useEffect(() => {
    dispatch(setLoadingMap(true));
    dispatch(fetchHotSpot(sidebarForm))
    .finally(() => {
      dispatch(setLoadingMap(false));
    });
    
  }, [dispatch, sidebarForm]);

  return (
    <>
      {hotSpotData.map((feature, index) => {
        
        // const { latitude, longitude } = feature.geometry.coordinates;
        return (
            <CircleMarker 
                key={index} 
                center={[feature?.LATITUDE, feature?.LONGITUDE]}
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