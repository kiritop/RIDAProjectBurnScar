import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAqiData } from './store/actions/aqiActions';

const App = () => {
  const dispatch = useDispatch();
  const { loading, data } = useSelector(state => state.aqi);

  useEffect(() => {
    dispatch(fetchAqiData());
  }, [dispatch]);

  return (
    <div className="App">
      {loading && <p>Loading...</p>}
      {data && (
        <div>
          <h1>Air Quality Index</h1>
          <p>City: {data.data.city.name}</p>
          <p>AQI: {data.data.aqi}</p>
        </div>
      )}
    </div>
  );
};

export default App;
