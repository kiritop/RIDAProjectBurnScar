// src/reducers/burntScarSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchBurntScarData = createAsyncThunk('burntScar/fetchBurntScarData', async () => {
    const response = await fetch("http://localhost:3000/process-shapefiles-demo");
    const data = await response.json();
    return data;
});

const burntScarSlice = createSlice({
  name: 'burntScar',
  initialState: { data: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBurntScarData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBurntScarData.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      });
  },
});

export default burntScarSlice.reducer;