import React, { useState } from 'react';
import MapContent from './components/MapContent';
import './App.css';
import Header from './components/Header'
import { Box, Drawer, List, ListItem, ListItemText } from '@mui/material'
import ToggleButton from './components/ToggleButton';

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
        <ToggleButton toggleDrawer={toggleDrawer}/>

        <Drawer anchor="right" open={isOpen} onClose={toggleDrawer}>
          <Box sx={{ width: 550 }}>
          <List>
            {['Option 1', 'Option 2', 'Option 3'].map((text, index) => (
              <ListItem button key={text}>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Box>
        </Drawer>
        <MapContent z/>
        
      </Box>
      
    </Box>
  );
}

export default App;

