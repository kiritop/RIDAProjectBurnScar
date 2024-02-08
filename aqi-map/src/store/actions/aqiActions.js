export const setAqiData = (data) => {
    return {
      type: 'SET_AQI_DATA',
      payload: data,
    };
  };
  
export const fetchAqiData = () => {
    return async (dispatch) => { // Return a function
        try {
        const response = await fetch('https://api.waqi.info/feed/here/?token=bc78d591c5a1ca3db96b08f0a9e249dce8a3085e');
        const data = await response.json();
        dispatch(setAqiData(data));
        } catch (error) {
        console.error('Error fetching AQI data:', error);
        }
    };
};
