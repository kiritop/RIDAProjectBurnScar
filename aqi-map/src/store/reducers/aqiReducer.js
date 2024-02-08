const initialState = {
    aqiData: null,
  };
  
  const aqiReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_AQI_DATA':
        return {
          ...state,
          aqiData: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default aqiReducer;