import React, { useEffect } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "../index.css";
import "leaflet/dist/leaflet.css";
import { useDispatch, useSelector } from 'react-redux';
import { fetchAqi } from '../reducers/aqiSlice';
import { setLoadingMap } from '../reducers/uiSlice';

const MapLocation = () => {
  const dispatch = useDispatch();
  const aqiData = useSelector(state => state.aqi.aqiData);
  const sidebarForm = useSelector(state => state.ui.sidebarForm);

  useEffect(() => {
    dispatch(setLoadingMap(true));
    dispatch(fetchAqi(sidebarForm))
    .finally(() => {
      dispatch(setLoadingMap(false));
    });
    
  }, [dispatch, sidebarForm]);

  const circleIcon = (index) => {
    // const aqi = (aqiData && aqiData?.[index]?.aqi?.pm25 ? aqiData?.[index]?.aqi.pm25.v : null)
    const aqi = (aqiData && aqiData?.[index]?.PM25 ? aqiData?.[index]?.PM25 : null) 
    let backgroundColor;

    if (aqi >= 0 && aqi <= 50) {
      backgroundColor = "#50C9F4";
    } else if (aqi >= 51 && aqi <= 100) {
      backgroundColor = "#78C150";
    } else if (aqi >= 101 && aqi <= 200) {
      backgroundColor = "#FFF46B";
    } else if (aqi >= 201 && aqi <= 300) {
      backgroundColor = "#F89836";
    } else if (aqi >= 301 && aqi <= 500) {
      backgroundColor = "#EC363A";
    } else if (aqi == null){
      backgroundColor = "#50C9F4";
    }
    const div = document.createElement("div");
    div.innerHTML = `
      <div style="
        position: relative;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: ${backgroundColor};
        color: white;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${(aqi==null)? 'N/A' : aqi}
      </div>
    `;
    return L.divIcon({
      html: div,
      className: "transparent-icon",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  return (
    <>
      {aqiData?.map((item, index) => (
        <Marker
          key={index}
          position={[item?.LATITUDE, item?.LONGITUDE]}
          icon={circleIcon(index)}
        >
          <Popup>
            <div className="mx-auto w-full">
              <h2 className="font-semibold capitalize text-lg">
                {item?.AP_EN} 
              </h2>
              <h3 className="font-semibold">
                {"AQI: " + (item?.PM25 && item?.PM25 ? item.PM25 : 'N/A')}
              </h3>
              <div className="mt-3 flex space-x-2">
                <h3>{item?.PV_EN}</h3>
                <h3>{item?.COUNTRY}</h3>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default MapLocation;
