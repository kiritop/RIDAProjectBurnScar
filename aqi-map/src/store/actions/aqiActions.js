export const FETCH_AQI_DATA = 'FETCH_AQI_DATA';
export const RECEIVE_AQI_DATA = 'RECEIVE_AQI_DATA';

export const fetchAqiData = () => {
  return async dispatch => {
    dispatch({ type: FETCH_AQI_DATA });
    try {
      const response = await fetch('https://api.waqi.info/feed/here/?token=bc78d591c5a1ca3db96b08f0a9e249dce8a3085e');
      const data = await response.json();
      dispatch({ type: RECEIVE_AQI_DATA, payload: data });
    } catch (error) {
      console.error('Error fetching AQI data: ', error);
    }
  };
};
