import MapContent from './components/MapContent';
// import Header from './layout/Header';
import Sidebar from './layout/Sidebar';
import './App.css';
import Header from './components/Header'
import { Box } from '@mui/material'

function App() {
  return (
    // <div className="App">
    //   {/* <Header /> */}
    //   {/* <Sidebar /> */}
    //   <MapContent z/>
    // </div>
     <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* <Sidebar /> */}
        <MapContent z/>
      </Box>
    </Box>
  );
}

export default App;

