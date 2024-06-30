// src/reducers/index.js
import { combineReducers } from "@reduxjs/toolkit";
import aqiReducer from "./aqiSlice";
import authReducer from "./authSlice";
import burntScarReducer from "./burntScarSlice";
import hotSpotReducer from "./hotSpotSlice";
import uiReducer from "./uiSlice";
import usersReducer from "./userSlice";
import tableReducer from "./tableSlice";
import dashboardSlice from "./dashboardSlice";

const rootReducer = combineReducers({
  aqi: aqiReducer,
  auth: authReducer,
  burnScar: burntScarReducer,
  hotSpot: hotSpotReducer,
  ui: uiReducer,
  users: usersReducer,
  table: tableReducer,
  dashboard: dashboardSlice,

  // คุณสามารถเพิ่ม reducers อื่น ๆ ที่นี่
});

export default rootReducer;
