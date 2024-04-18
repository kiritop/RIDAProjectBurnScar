// src/reducers/aqiSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import data from "./json/data_state_all.json";
import CONFIG from "../config";

export const fetchDashboard = createAsyncThunk("dashboard/fetchData", async () => {
  const promises = data.map(async (location) => {
    const url = `https://api.waqi.info/feed/geo:${location.lat};${location.lng}/?token=${CONFIG.AQI_API_KEY}`;
    try {
      const response = await axios.get(url);
      return { ...location, aqi: response.data.data.iaqi };
    } catch (error) {
      console.error(error);
      return null;
    }
  });

  // รอให้ทุก promises สำเร็จแล้วคืนค่าผลลัพธ์
  const DashboardData = await Promise.all(promises);

  return DashboardData;
});

export const DashboardSlice = createSlice({
  name: "db",
  initialState: { data: [], loading: false, filter: "" },
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      });
  },
});

export const { setFilter } = DashboardSlice.actions;

export default DashboardSlice.reducer;
