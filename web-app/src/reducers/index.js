// src/reducers/index.js
import { combineReducers } from '@reduxjs/toolkit';
import aqiReducer from './aqiSlice';
import burntScarReducer from './burntScarSlice';
import hotSpotReducer from './hotSpotSlice';

const rootReducer = combineReducers({
  aqi: aqiReducer,
  burnScar: burntScarReducer,
  hotSpot: hotSpotReducer
  // คุณสามารถเพิ่ม reducers อื่น ๆ ที่นี่
});

export default rootReducer;
