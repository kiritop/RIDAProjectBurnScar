import React from 'react';
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const aqiData = useSelector(state => state.aqi.aqiData);

  return (
    <div className="sidebar">
      <h2>AQI Data</h2>
      {aqiData && (
        <ul>
          {aqiData.map((item, index) => (
            <li key={index}>{item.location}: {item.aqi}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;