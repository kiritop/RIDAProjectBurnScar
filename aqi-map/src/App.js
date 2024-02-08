import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import { fetchAqiData } from './store/actions/aqiActions';

const App = () => {
  const dispatch = useDispatch();
  const aqiData = useSelector(state => state.aqi.aqiData);

  useEffect(() => {
    dispatch(fetchAqiData());
  }, [dispatch]);

  return (
    <div className="App">
      <Map aqiData={aqiData} />
      {/* <Sidebar /> */}
    </div>
  );
}

export default App;
