// ToggleButton.js
import React from 'react';
import { Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
export default function ToggleButton({ toggleDrawer }) {
  return (
    <Button 
      onClick={toggleDrawer} 
      style={{ 
        position: 'absolute', 
        top: '20%', 
        left: '10px',
        zIndex: 1000  
      }}
    >
      <CheckIcon />
    </Button>
  );
}