import React from 'react';
import { Box } from '@mui/system';
import { Paper, Typography } from '@mui/material';

const ColorBar = () => {
    const colors = ['#feb9b9', '#f88', '#ff5757', '#ff2626', '#f40000', '#c30000', '#920000', '#610000', '#300000'];
  
    return (
      <Box display="flex" flexDirection="column" alignItems="center" padding={1}>
          <Typography fontWeight="bold" >Burnt Frequency (times)</Typography> {/* เพิ่มระยะห่างระหว่างบาร์สีและตัวเลข */}
        {colors.map((color, index) => (
          <Box key={index} display="flex" alignItems="center">
            <Paper
              sx={{
                width: '25px',
                height: '30px',
                backgroundColor: color,
                marginTop: 0.5,
              }}
            />
            <Typography sx={{ marginLeft: 2 }} fontWeight="bold" >{index + 1}</Typography> {/* เพิ่มระยะห่างระหว่างบาร์สีและตัวเลข */}
          </Box>
        ))}
      </Box>
    );
  };

export default ColorBar;