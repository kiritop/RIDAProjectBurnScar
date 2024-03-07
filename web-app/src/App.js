import React, { useState } from 'react';
import MapContent from './components/MapContent';
import './App.css';
import Header from './components/Header'
import { Box, Drawer, List, ListItem, ListItemText } from '@mui/material'
import ToggleButton from './components/ToggleButton';
import Sidebar from "./layout/Sidebar";
// import ToggleButton from '@mui/material/ToggleButton';


function App() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };
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
        {/* <ToggleButton toggleDrawer={toggleDrawer}/> */}
        <ToggleButton isOpen={isOpen} toggleDrawer={toggleDrawer} />
        <MapContent z/>
        <Sidebar isOpen={isOpen}  toggleDrawer={toggleDrawer}/>
      </Box>
      
    </Box>
  );
}

export default App;

