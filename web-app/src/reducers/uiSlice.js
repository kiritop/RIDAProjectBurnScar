// src/reducers/uiSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import data from './json/data_state.json';
import dayjs from 'dayjs';

// Async action using createAsyncThunk
export const saveLayerSettings = createAsyncThunk(
  'layer/saveLayerSettings',
  async (settings) => {
    return settings
  }
);

const currentDate = new Date();
const startDate = new Date();
const year = currentDate.getFullYear();

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    isSidebarOpen: false,
    sidebarForm :{
      yearRange : [year, year],
      country : 'All',
      city : 'All',
      date: dayjs(currentDate).format('YYYY-MM-DD'),
      startDate : dayjs(startDate.setFullYear(startDate.getFullYear() - 5)).format('YYYY-MM-DD'),
      endDate : dayjs(currentDate).format('YYYY-MM-DD'),
      iso3: null
    },
    current_lat: "18.7889", 
    current_lng: "98.9833", 
    burntScar: true,
    aqi: false,
    hotSpot: false,
    burntScarPoint: false,
    status: "idle",
    loadingMap: false,
    loadingSidebar: false,
    cities: [],
    error: null, // สร้าง state สำหรับข้อมูล form control ของ Sidebar
  },
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    updateSidebarForm: (state, action) => {
      state.sidebarForm = action.payload; // อัปเดตข้อมูล form control ของ Sidebar
    },
    setLoadingMap: (state, action) => {
      state.loadingMap = action.payload;
    },
    setLoadingSidebar: (state, action) => {
      state.loadingSidebar = action.payload;
    },
    getCities: (state, action) => {
      
      const country = action.payload;
      let cities_data = data.filter(item => item.country === country);
      state.cities = cities_data.sort((a, b) => a.city.localeCompare(b.city));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveLayerSettings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(saveLayerSettings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Add any fetched data to the state
        state.sidebarForm = {...action.payload.sidebarForm}
        state.burntScar = action.payload.burntScar;
        state.aqi = action.payload.aqi;
        state.hotSpot = action.payload.hotSpot;
        state.burntScarPoint = action.payload.burntScarPoint;
        state.current_lat = action.payload.current_lat;
        state.current_lng = action.payload.current_lng;
      })
      .addCase(saveLayerSettings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { toggleSidebar, updateSidebarForm, setLoadingMap, setLoadingSidebar, getCities } = uiSlice.actions;

export default uiSlice.reducer;
