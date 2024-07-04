// src/reducers/hotSpotSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Papa from 'papaparse';
import CONFIG from '../config';

export const fetchHotSpotData = createAsyncThunk('hotSpot/fetchHotSpotData', async (filter) => {
    // รับวันที่ปัจจุบัน
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // เดือนเริ่มต้นที่ 0
    const day = String(currentDate.getDate()).padStart(2, '0');
    
    // Fetch the CSV data from the API URL
    if(filter.iso3){
      const response = await fetch(`https://firms.modaps.eosdis.nasa.gov/api/country/csv/${CONFIG.HOT_SPOT_API_KEY}/MODIS_NRT/${filter.iso3}/1/${year}-${month}-${day}`);
      const csvData = await response.text();
      // Parse the CSV data
      let data;
      Papa.parse(csvData, {
          header: true, // Assumes the first row contains column headers
          complete: (result) => {
              data = result.data; // Set the JSON data
          },
      });
      return data;

    }else{
      const response = await fetch(`https://firms.modaps.eosdis.nasa.gov/api/area/csv/${CONFIG.HOT_SPOT_API_KEY}/MODIS_NRT/world/1/${year}-${month}-${day}`);
      const csvData = await response.text();
      // Parse the CSV data
      let data;
      Papa.parse(csvData, {
          header: true, // Assumes the first row contains column headers
          complete: (result) => {
              data = result.data; // Set the JSON data
          },
      });
      return data;
    }
    
});

export const fetchHotSpot = createAsyncThunk('hotSpot/fetchHotSpot', async (filter) => {
  const response = await fetch(`${CONFIG.API_URL}/get-hotspot-from-date?date=${filter.date}${filter.country==='ALL'?'': '&country='+filter.country}${(filter.province==="ALL")?'': '&province='+filter.province}`);
  const data = await response.json();
  return data;
});

const hotSpotSlice = createSlice({
  name: 'hotSpot',
  initialState: { data: [], loading: false, dataHotSpot: [] },
  reducers: {
    clearData: (state) => {
      state.data = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotSpotData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHotSpotData.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchHotSpot.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHotSpot.fulfilled, (state, action) => {
        state.dataHotSpot = action.payload;
        state.loading = false;
      });
  },
});

export const { clearData } = hotSpotSlice.actions;

export default hotSpotSlice.reducer;