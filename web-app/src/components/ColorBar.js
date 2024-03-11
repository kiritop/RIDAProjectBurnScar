import React from 'react';
import { Box } from '@mui/system';
import { Typography  } from '@mui/material';
import { styled } from '@mui/system';

const ColorBar = () => {

 const GradientBar = styled('div')(({ theme }) => ({
    height: '30vh', // ความสูงเป็น 50% ของ viewport height
    background: 'linear-gradient(0deg, #fde835 0%, #ff3d00 100%)',
    display: 'flex',
    flexDirection: 'column-reverse',
    justifyContent: 'space-between',
    padding: theme.spacing(1),
}));
  
    return (
      <Box display="flex" flexDirection="column" alignItems="center" padding={1}>
          <Typography fontWeight="bold" >Burnt ratio</Typography> {/* เพิ่มระยะห่างระหว่างบาร์สีและตัวเลข */}
          <GradientBar>
            {[1, 20, 40, 60, 80, 100].map((i) => (
              <Typography fontWeight="bold" variant="body2" key={i}>
                {i}%
              </Typography>
            ))}
          </GradientBar>
      </Box>
    );
  };

export default ColorBar;