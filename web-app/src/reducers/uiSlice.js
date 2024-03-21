// src/reducers/uiSlice.js
import { ContactSupportOutlined } from '@mui/icons-material';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async action using createAsyncThunk
export const saveLayerSettings = createAsyncThunk(
  'layer/saveLayerSettings',
  async (settings) => {
    console.log("settings", settings)
    // const response = await axios.post('/api/save', settings);
    // return response.data;
    return settings
  }
);

const currentDate = new Date();
const year = currentDate.getFullYear();

const uiSlice = createSlice({
  name: 'ui',
  initialState: { 
    isSidebarOpen: false,
    sidebarForm :{
      yearRange : [year, year],
      country : 'All',
      province : 'All'
    },
    current_lat: "18.7889", 
    current_lng: "98.9833", 
    burntScar: true,
    aqi: false,
    hotSpot: false,
    status: 'idle',
    loadingMap: false,
    loadingSidebar: false,
    error: null // สร้าง state สำหรับข้อมูล form control ของ Sidebar
  },
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    updateSidebarForm: (state, action) => {
      console.lop("action.payload", action.payload)
      state.sidebarForm = action.payload; // อัปเดตข้อมูล form control ของ Sidebar
    },
    setLoadingMap: (state, action) => {
      state.loadingMap = action.payload;
    },
    setLoadingSidebar: (state, action) => {
      state.loadingSidebar = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveLayerSettings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(saveLayerSettings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Add any fetched data to the state
        state.sidebarForm = {...action.payload.sidebarForm}
        state.burntScar = action.payload.burntScar;
        state.aqi = action.payload.aqi;
        state.current_lat = action.payload.current_lat;
        state.current_lng = action.payload.current_lng;
      })
      .addCase(saveLayerSettings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { toggleSidebar, updateSidebarForm, setLoadingMap, setLoadingSidebar } = uiSlice.actions;

export default uiSlice.reducer;