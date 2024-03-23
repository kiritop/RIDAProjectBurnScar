// src/reducers/burntScarSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import CONFIG from '../config';

export const fetchBurntScarData = createAsyncThunk('burntScar/fetchBurntScarData', async (filter) => {
    const response = await fetch(`${CONFIG.API_URL}/process-shapefiles-demo?yearfrom=${filter.yearRange[0]}&yearto=${filter.yearRange[1]}&country=${filter.country==='All'?'':filter.country}&state=${filter.province==='All'?'':filter.province}`);
    const data = await response.json();
    return data;
});

const burntScarSlice = createSlice({
  name: 'burntScar',
  initialState: { data: [], loading: false },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBurntScarData.pending, (state) => {
        state.data = [];
        state.loading = true;
      })
      .addCase(fetchBurntScarData.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      });
  },
});

export default burntScarSlice.reducer;