// src/reducers/burntScarSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import CONFIG from '../config';

export const fetchBurntScarData = createAsyncThunk('burntScar/fetchBurntScarData', async (filter) => {
    const response = await fetch(`${CONFIG.API_URL}/get-burnt-point-from-date?startDate=${filter.startDate}&endDate=${filter.endDate}${filter.country==='All'?'': '&country='+filter.iso3}${(filter.city==="All")?'': '&province='+filter.city}`);
    const data = await response.json();
    return data;
});

export const fetchBurntScarPolygon = createAsyncThunk('burntScar/fetchBurntScarPolygon', async (filter) => {
  const response = await fetch(`${CONFIG.API_URL}/get-burnt-from-date?startDate=${filter.startDate}&endDate=${filter.endDate}${filter.country==='All'?'': '&country='+filter.iso3}${(filter.city==="All")?'': '&province='+filter.city}`);
  const data = await response.json();
  return data;
});

export const getMax = createAsyncThunk('burntScar/getMax', async (filter) => {
  const response = await fetch(`${CONFIG.API_URL}/get-max-freq?startDate=${filter.startDate}&endDate=${filter.endDate}${filter.country==='All'?'': '&country='+filter.iso3}${(filter.city==="All")?'': '&province='+filter.city}`);
  const data = await response.json();
  return data;
});



const burntScarSlice = createSlice({
  name: 'burntScar',
  initialState: { data: [], loading: false, max:1 },
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
        state.max = action.payload.features;
        state.loading = false;
      });
  },
});

export default burntScarSlice.reducer;