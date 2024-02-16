import React, { useEffect, useState } from "react";
import axios from "axios";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "../index.css";
import "leaflet/dist/leaflet.css";

const APIkey = "bc78d591c5a1ca3db96b08f0a9e249dce8a3085e";

const MapLocation = () => {
  const [data, setData] = useState(null);
  const [airData, setAirData] = useState(null);

  const circleIcon = (index) => {
    const aqi = airData?.[index]?.data?.aqi ?? null;

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
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${aqi}
      </div>
    `;
    return L.divIcon({
      html: div,
      className: "transparent-icon",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  useEffect(() => {
    const fetchJson = async () => {
      axios
        .get("json/geo.json")
        .then((response) => {
          setData(response.data);
        })
        .catch((err) => {});
    };

    fetchJson();
  }, []);

  useEffect(() => {
    const fetchAirAPI = async () => {
      if (data) {
        const promises = data.map(async (location) => {
          const url = `https://api.waqi.info/feed/geo:${location.lat};${location.long}/?token=${APIkey}`;
          try {
            const response = await axios.get(url);
            console.log(response.data);
            return response.data;
          } catch (error) {
            console.error(error);
            return null;
          }
        });
        const apiData = await Promise.all(promises);
        setAirData(apiData);
      }
    };

    fetchAirAPI();
  }, [data]);

  return (
    <>
      {data?.map((item, index) => (
        <Marker
          key={index}
          position={[item?.lat, item?.long]}
          icon={circleIcon(index)}
        >
          <Popup>
            <div className="mx-auto w-full">
              <h2 className="font-semibold capitalize text-lg">
                {item?.city} 
              </h2>
              <h3 className="font-semibold">
                {"AQI: " + airData?.[index]?.data?.aqi ?? null}
              </h3>
              <div className="mt-3 flex space-x-2">
                <h3>{item?.admin_name}</h3>
                <h3>{item?.country}</h3>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default MapLocation;
