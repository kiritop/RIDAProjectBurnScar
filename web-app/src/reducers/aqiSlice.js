// src/reducers/aqiSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import data from './json/asean.json';
import CONFIG from '../config';

export const fetchAqiData = createAsyncThunk('aqi/fetchAqiData', async () => {
    // โหลดข้อมูลจาก geo.json
    // const geoResponse = await axios.get('./json/geo.json');
    // สร้าง array ของ promises สำหรับดึงข้อมูล AQI สำหรับแต่ละพิกัด
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
    const aqiData = await Promise.all(promises);

    return aqiData;
});

export const aqiSlice = createSlice({
  name: 'aqi',
  initialState: { data: [], loading: false, filter: '' },
  reducers: {
    setFilter: (state, action) => { state.filter = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAqiData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAqiData.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      });
  },
});

export const { setFilter } = aqiSlice.actions;

export default aqiSlice.reducer;
