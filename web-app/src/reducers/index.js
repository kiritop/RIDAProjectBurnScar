// src/reducers/index.js
import { combineReducers } from '@reduxjs/toolkit';
import aqiReducer from './aqiSlice';

const rootReducer = combineReducers({
  aqi: aqiReducer,
  // คุณสามารถเพิ่ม reducers อื่น ๆ ที่นี่
});

export default rootReducer;
