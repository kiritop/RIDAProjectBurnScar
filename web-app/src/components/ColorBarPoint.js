import React from 'react';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';
import { styled } from '@mui/system';

const colorIntensityArray = [
  { fillOpacity: 0.2, color: '#FFCCCC' },
  { fillOpacity: 0.4, color: '#FF9999' },
  { fillOpacity: 0.6, color: '#FF6666' },
  { fillOpacity: 0.8, color: '#FF3232' },
  { fillOpacity: 1.0, color: '#FF0000' }
];

const ColorBar = () => {

  const GradientBar = styled('div')(({ theme }) => ({
    height: '30vh', // ความสูงเป็น 30% ของ viewport height
    display: 'flex',
    flexDirection: 'column-reverse',
    justifyContent: 'space-between',
    padding: theme.spacing(1),
  }));

  return (
    <Box display="flex" flexDirection="column" alignItems="center" padding={1}>
      <Typography fontWeight="bold">Burnt level color</Typography> {/* เพิ่มระยะห่างระหว่างบาร์สีและตัวเลข */}
      <GradientBar>
        {colorIntensityArray.map((item, index) => (
          <Box
            key={index}
            width="100%"
            height={`${100 / colorIntensityArray.length}%`}
            bgcolor={item.color}
          >
            {index === 0 || index === colorIntensityArray.length - 1 ? (
              <Typography fontWeight="bold" variant="body2">
                {index+1} times
              </Typography>
            ) : null}
          </Box>
        ))}
      </GradientBar>
    </Box>
  );
};

export default ColorBar;