// src/reducers/index.js
import { combineReducers } from "@reduxjs/toolkit";
import aqiReducer from "./aqiSlice";
import burntScarReducer from "./burntScarSlice";
import hotSpotReducer from "./hotSpotSlice";
import uiReducer from "./uiSlice";
import usersReducer from "./userSlice";
import getfilepath from "./getfilepath";


const rootReducer = combineReducers({
  aqi: aqiReducer,
  burnScar: burntScarReducer,
  hotSpot: hotSpotReducer,
  ui: uiReducer,
  users: usersReducer,
  getFile : getfilepath
 
  // คุณสามารถเพิ่ม reducers อื่น ๆ ที่นี่
});

export default rootReducer;
