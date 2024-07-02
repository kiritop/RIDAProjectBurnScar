// src/reducers/burntScarSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as topojson from 'topojson-client';
import CONFIG from '../config';

export const fetchBurntScarData = createAsyncThunk('burntScar/fetchBurntScarData', async (filter) => {
    const response = await fetch(`${CONFIG.API_URL}/get-burnt-point-from-date?startDate=${filter.startDate}&endDate=${filter.endDate}${filter.country==='All'?'': '&country='+filter.iso3}${(filter.city==="All")?'': '&province='+filter.city}`);
    const data = await response.json();
    return data;
});

export const fetchBurntScarPolygon = createAsyncThunk('burntScar/fetchBurntScarPolygon', async (filter) => {
  const response = await fetch(`${CONFIG.API_URL}/get-burnt-from-date?startDate=${filter.startDate}&endDate=${filter.endDate}${filter.country === 'ALL' ? '' : '&country=' + filter.country}${(filter.province === "All") ? '' : '&province=' + filter.province}`);
  const data = await response.json();
  return data;
});

// export const fetchBurntScarPolygon = createAsyncThunk('burntScar/fetchBurntScarPolygon', async (filter) => {
//   const response = await fetch(`${CONFIG.API_URL}/get-burnt-from-date-topo?startDate=${filter.startDate}&endDate=${filter.endDate}${filter.country === 'ALL' ? '' : '&country=' + filter.country}${(filter.province === "All") ? '' : '&province=' + filter.province}`);
//   const data = await response.json();

//   // Convert TopoJSON to GeoJSON
//   const geojson = topojson.feature(data, data.objects.collection); // Adjust the object name based on your topology structure

//   return geojson;
// });

export const getMax = createAsyncThunk('burntScar/getMax', async (filter) => {
  const response = await fetch(`${CONFIG.API_URL}/get-max-freq?startDate=${filter.startDate}&endDate=${filter.endDate}${filter.country==='ALL'?'': '&country='+filter.country}${(filter.province==="ALL")?'': '&province='+filter.province}`);
  const data = await response.json();
  return data;
});



const burntScarSlice = createSlice({
  name: 'burntScar',
  initialState: { data: [], loading: false, max:5 },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBurntScarData.pending, (state) => {
        state.data = [];
        state.loading = true;
      })
      .addCase(fetchBurntScarData.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchBurntScarPolygon.pending, (state) => {
        state.data = [];
        state.loading = true;
      })
      .addCase(fetchBurntScarPolygon.fulfilled, (state, action) => {
        state.data = action.payload.features;
        state.loading = false;
      })
      .addCase(getMax.pending, (state) => {
        state.max = 1;
        state.loading = true;
      })
      .addCase(getMax.fulfilled, (state, action) => {
        state.max = action.payload.max_unique_date_count;
        state.loading = false;
      });
  },
});

export default burntScarSlice.reducer;