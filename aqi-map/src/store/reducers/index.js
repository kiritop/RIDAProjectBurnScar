import { combineReducers } from 'redux';
import aqiReducer from './aqiReducer';

const rootReducer = combineReducers({
  aqi: aqiReducer,
});

export default rootReducer;