import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useMap } from "react-leaflet";
import { saveLayerSettings } from '../reducers/uiSlice'; // ต้องการ import uiSlice ที่มี saveLayerSettings.fulfilled

const ChangeView = () => {
  const map = useMap();
  const { status, current_lat, current_lng } = useSelector(state => state.ui);

  useEffect(() => {
    console.log("status", status)
    if (status === "succeeded") {
      map.setView([current_lat, current_lng], 9);
    }
  }, [status, current_lat, current_lng, map]);

  return null;
}

export default ChangeView;