import { FETCH_AQI_DATA, RECEIVE_AQI_DATA } from './../actions/aqiActions';

const initialState = {
  loading: false,
  data: null,
};

const aqiReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_AQI_DATA:
      return { ...state, loading: true };
    case RECEIVE_AQI_DATA:
      return { ...state, loading: false, data: action.payload };
    default:
      return state;
  }
};

export default aqiReducer;