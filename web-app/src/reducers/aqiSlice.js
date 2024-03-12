// src/reducers/aqiSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const APIkey = "bc78d591c5a1ca3db96b08f0a9e249dce8a3085e";

export const fetchAqiData = createAsyncThunk('aqi/fetchAqiData', async () => {
    // โหลดข้อมูลจาก geo.json
    const geoResponse = await axios.get('./json/geo.json');
    const geoData = geoResponse.data;

    // สร้าง array ของ promises สำหรับดึงข้อมูล AQI สำหรับแต่ละพิกัด
    const promises = geoData.map(async (location) => {
        const url = `https://api.waqi.info/feed/geo:${location.lat};${location.long}/?token=${APIkey}`;
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
