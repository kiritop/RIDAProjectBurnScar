// ToggleButton.js
import React from 'react';
import { Button , IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function ToggleButton({ isOpen, toggleDrawer }) {
  return (
    <Button  
      onClick={toggleDrawer} 
      variant="contained"
      style={{ 
        position: 'absolute', 
        top: '20%', 
        left: '10px',
        zIndex: 1000  
      }}
    >
      {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      ฟหฟห
    </Button>
  );
}