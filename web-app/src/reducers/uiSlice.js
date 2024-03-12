// src/reducers/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { 
    isSidebarOpen: false,
    sidebarForm: {} // สร้าง state สำหรับข้อมูล form control ของ Sidebar
  },
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    updateSidebarForm: (state, action) => {
      state.sidebarForm = action.payload; // อัปเดตข้อมูล form control ของ Sidebar
    },
  },
});

export const { toggleSidebar, updateSidebarForm } = uiSlice.actions;

export default uiSlice.reducer;