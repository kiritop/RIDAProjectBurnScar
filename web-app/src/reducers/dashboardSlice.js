// src/reducers/aqiSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config";

export const fetchHotspotData = createAsyncThunk("dashboard/fetchHotspotData", async () => {
  const date = new Date();
  const formattedDate = date.toISOString().slice(0, 10);

  const urls = [
    `https://firms.modaps.eosdis.nasa.gov/api/country/csv/579db9c41c852c1f75bc6b73f8b90262/MODIS_NRT/THA/1/${formattedDate}`,
    `https://firms.modaps.eosdis.nasa.gov/api/country/csv/579db9c41c852c1f75bc6b73f8b90262/MODIS_NRT/MMR/1/${formattedDate}`,
    `https://firms.modaps.eosdis.nasa.gov/api/country/csv/579db9c41c852c1f75bc6b73f8b90262/MODIS_NRT/LAO/1/${formattedDate}`,
    `https://firms.modaps.eosdis.nasa.gov/api/country/csv/579db9c41c852c1f75bc6b73f8b90262/MODIS_NRT/VNM/1/${formattedDate}`,
  ];

  const promises = urls.map(async (url) => {
    try {
      const response = await axios.get(url);
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.data.length - 1;
    } catch (error) {
      console.error(error);
      return null;
    }
  });

  const DashboardData = await Promise.all(promises);

  return DashboardData;
});

export const fetchPM25Data = createAsyncThunk("dashboard/fetchPM25Data", async (filter) => {
  const promises = filter.map(async (location) => {
    const url = `https://api.waqi.info/feed/geo:${location.lat};${location.lng}/?token=${CONFIG.AQI_API_KEY}`;
    try {
      const response = await axios.get(url);

      const pm25Value = response?.data?.data?.iaqi?.pm25?.v ;
      return { city: location.city, pm25: pm25Value };
      // return { ...location, aqi: response.data.data.iaqi };
    } catch (error) {
      console.error(error);
      return null;
    }
  });

  // รอให้ทุก promises สำเร็จแล้วคืนค่าผลลัพธ์
  const DashboardData = await Promise.all(promises);
  DashboardData.sort((a, b) => b.pm25 - a.pm25);

  return DashboardData;
});

export const DashboardSlice = createSlice({
  name: "dashboard",
  initialState: { dataHotspot: [], dataPM25: [], loading: false, filter: "TH" },
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPM25Data.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPM25Data.fulfilled, (state, action) => {
        state.dataPM25 = action.payload;
        state.loading = false;
      })
      .addCase(fetchHotspotData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHotspotData.fulfilled, (state, action) => {
        state.dataHotspot = action.payload;
        state.loading = false;
      });
  },
});

export const { setFilter } = DashboardSlice.actions;

export default DashboardSlice.reducer;
