import React from 'react';
import { Box } from '@mui/system';
import { Typography  } from '@mui/material';
import { styled } from '@mui/system';

const ColorBar = () => {

  const GradientBar = styled('div')(({ theme }) => ({
    // height: '200px',
    background: 'linear-gradient(180deg, #fde835 0%, #ff3d00 100%)',
    display: 'flex',
    flexDirection: 'column-reverse',
    justifyContent: 'space-between',
    // alignItems: 'flex-start', // Add this line
    padding: theme.spacing(1),
  }));
  
  // const percentToColor = (percent) => {
  //   const value = percent / 100;
  //   const red = Math.round(255);
  //   const green = Math.round(255 * (1 - value));
  //   const blue = 0;
  
  //   // Convert RGB to HEX
  //   const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
  //     const hex = x.toString(16);
  //     return hex.length === 1 ? '0' + hex : hex;
  //   }).join('');
  
  //   return rgbToHex(red, green, blue); // Only green component changes
  // };
  
  

    // const colors = ['#feb9b9', '#f88', '#ff5757', '#ff2626', '#f40000', '#c30000', '#920000', '#610000', '#300000'];
    return (
      <Box display="flex" flexDirection="column" alignItems="center" padding={1}>
          <Typography fontWeight="bold" >Burnt Frequency (percent)</Typography> {/* เพิ่มระยะห่างระหว่างบาร์สีและตัวเลข */}
          <GradientBar>
            {[...Array(11).keys()].reverse().map((i) => ( // Reverse the array to display from top to bottom
              <Typography variant="body2" key={i}>
                {i==0 ? 1 : i * 10}%
              </Typography>
            ))}
          </GradientBar>
      </Box>
    );
  };

export default ColorBar;