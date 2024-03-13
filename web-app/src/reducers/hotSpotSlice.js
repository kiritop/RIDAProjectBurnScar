// src/reducers/hotSpotSlice.js
import { LocalConvenienceStoreOutlined } from '@mui/icons-material';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Papa from 'papaparse';

const APIkey = "_YOUR_API_KEY_";

export const fetchHotSpotData = createAsyncThunk('hotSpot/fetchHotSpotData', async () => {
    // รับวันที่ปัจจุบัน
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // เดือนเริ่มต้นที่ 0
    const day = String(currentDate.getDate()).padStart(2, '0');

    // Fetch the CSV data from the API URL
    const response = await fetch(`https://firms.modaps.eosdis.nasa.gov/api/area/csv/${APIkey}/MODIS_NRT/world/1/${year}-${month}-${day}`);
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
});

const hotSpotSlice = createSlice({
  name: 'hotSpot',
  initialState: { data: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotSpotData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHotSpotData.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      });
  },
});

export default hotSpotSlice.reducer;