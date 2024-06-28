// src/reducers/aqiSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Papa from "papaparse";
import CONFIG from "../config";
import { geocode } from "react-geocode";

const date = new Date();
const formattedDate = date.toISOString().slice(0, 10);

console.log(formattedDate);

export const fetchProvinceByCountry = createAsyncThunk("dashboard/fetchProvinceByCountry", async (object) => {
  try{
    const response = await fetch(`${CONFIG.API_URL}/get-province?country=${object.country}&module=${object.module}`);
    const data = await response.json();
    return data;
  }catch (error){
    console.error(error);
    return null;
  }

});

export const fetchBurntChart = createAsyncThunk("dashboard/fetchBurntChart", async (object) => {
  try{
    const response = await fetch(`${CONFIG.API_URL}/line-chart?country=${object.country}&province=${object.province}&startDate=${object.startDate}&endDate=${object.endDate}`);
    const data = await response.json();
    return data;
  }catch (error){
    console.error(error);
    return null;
  }

});

export const fetchBubbleBurntMap = createAsyncThunk("dashboard/fetchBubbleBurntMap", async (object) => {
  try{
    const response = await fetch(`${CONFIG.API_URL}/burnt-bubble-chart?country=${object.country}&province=${object.province}&startDate=${object.startDate}&endDate=${object.endDate}`);
    const data = await response.json();
    return data;
  }catch (error){
    console.error(error);
    return null;
  }

});

export const fetchAqiChart = createAsyncThunk("dashboard/fetchAqiChart", async (object) => {
  try{
    const response = await fetch(`${CONFIG.API_URL}/line-chart-pm25?country=${object.country}&province=${object.province}&startDate=${object.startDate}&endDate=${object.endDate}`);
    const data = await response.json();
    return data;
  }catch (error){
    console.error(error);
    return null;
  }

});

export const fetchHotspotChart = createAsyncThunk("dashboard/fetchHotspotChart", async (object) => {
  try{
    const response = await fetch(`${CONFIG.API_URL}/line-chart-hot-spot?country=${object.country}&province=${object.province}&startDate=${object.startDate}&endDate=${object.endDate}`);
    const data = await response.json();
    return data;
  }catch (error){
    console.error(error);
    return null;
  }

});

export const fetchBurntDataTable = createAsyncThunk("dashboard/fetchBurntDataTable", async (object) => {
  try{
    const response = await fetch(`${CONFIG.API_URL}/overview-table?country=${object.country}&province=${object.province}&fromDate=${object.startDate}&toDate=${object.endDate}`);
    const data = await response.json();
    return data;
  }catch (error){
    console.error(error);
    return null;
  }

});


export const fetchAqiDataTable = createAsyncThunk("dashboard/fetchAqiDataTable", async (object) => {
  try{
    const response = await fetch(`${CONFIG.API_URL}/overview-table-pm25?country=${object.country}&province=${object.province}&fromDate=${object.startDate}&toDate=${object.endDate}`);
    const data = await response.json();
    return data;
  }catch (error){
    console.error(error);
    return null;
  }

});

export const fetchHotspotDataTable = createAsyncThunk("dashboard/fetchHotspotDataTable", async (object) => {
  try{
    const response = await fetch(`${CONFIG.API_URL}/overview-table-hot-spot?country=${object.country}&province=${object.province}&fromDate=${object.startDate}&toDate=${object.endDate}`);
    const data = await response.json();
    return data;
  }catch (error){
    console.error(error);
    return null;
  }

});


export const DashboardSlice = createSlice({
  name: "dashboard",
  initialState: { 
    dataHotspot: [], 
    dataHotspotCountry: [], 
    dataAqiTable: [], 
    dataHotspotTable:[],
    loading: false,
    dataProvince:[],
    dataBurntTable:[],
    dataBurntChart:[],
    dataAqiChart:[],
    dataHotspotChart:[],
    dataBurntBubbleMap:[]
  },
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchProvinceByCountry.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProvinceByCountry.fulfilled, (state, action) => {
        state.dataProvince = action.payload;
        state.loading = false;
      })
      .addCase(fetchBurntChart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBurntChart.fulfilled, (state, action) => {
        state.dataBurntChart = action.payload;
        state.loading = false;
      })
      .addCase(fetchAqiChart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAqiChart.fulfilled, (state, action) => {
        state.dataAqiChart = action.payload;
        state.loading = false;
      })
      .addCase(fetchHotspotChart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHotspotChart.fulfilled, (state, action) => {
        state.dataHotspotChart = action.payload;
        state.loading = false;
      })
      .addCase(fetchBurntDataTable.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBurntDataTable.fulfilled, (state, action) => {
        state.dataBurntTable = action.payload;
        state.loading = false;
      })
      .addCase(fetchAqiDataTable.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAqiDataTable.fulfilled, (state, action) => {
        state.dataAqiTable = action.payload;
        state.loading = false;
      })
      .addCase(fetchHotspotDataTable.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHotspotDataTable.fulfilled, (state, action) => {
        state.dataHotspotTable = action.payload;
        state.loading = false;
      })
      .addCase(fetchBubbleBurntMap.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBubbleBurntMap.fulfilled, (state, action) => {
        state.dataBurntBubbleMap = action.payload;
        state.loading = false;
      })
      
  },
});

export const { setFilter } = DashboardSlice.actions;

export default DashboardSlice.reducer;
