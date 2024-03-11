// ToggleButton.js
import React from 'react';
import { Fab } from '@mui/material';
import { styled } from '@mui/system';
import LayersIcon  from '@mui/icons-material/Layers';

const StyledFab = styled(Fab)({
  position: 'absolute',
  top: '20%',
  right: 16,
  color: '#50C1DD', // สีของไอคอน
  backgroundColor: '#FFFFFF', // สีของปุ่ม
  '&:hover': {
    backgroundColor: '#e0e0e0', // สีของปุ่มเมื่อผู้ใช้เลื่อนเมาส์ไปวางบนปุ่ม
  },
});

export default function ToggleButton({ isOpen, toggleDrawer }) {
  return (
    <StyledFab color="inherit" onClick={toggleDrawer} >
      <LayersIcon  />
    </StyledFab>
  );
}