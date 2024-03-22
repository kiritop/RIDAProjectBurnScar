import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useMap } from "react-leaflet";

const ChangeView = () => {
  const map = useMap();
  const { status, current_lat, current_lng } = useSelector(state => state.ui);

  useEffect(() => {
    if (status === "succeeded") {
      map.setView([current_lat, current_lng], 9);
    }
  }, [status, current_lat, current_lng, map]);

  return null;
}

export default ChangeView;