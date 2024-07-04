import React from 'react';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';
import { styled } from '@mui/system';
import { useSelector } from 'react-redux';
import { colors, getColorByFrequency } from '../utils/colorUtils'; // Import the utility function

const ColorBar = () => {
  const max_freq = useSelector(state => state.burnScar.max);

  // Generate colorIntensityArray dynamically based on max_freq
  const generateColorIntensityArray = (max_freq) => {
    const intensityArray = [];
    for (let i = 1; i <= max_freq; i++) {
      intensityArray.push({
        color: getColorByFrequency(i, max_freq)
      });
    }
    return intensityArray;
  };

  const colorIntensityArray = generateColorIntensityArray(max_freq);

  const GradientBar = styled('div')(({ theme }) => ({
    height: '30vh',
    display: 'flex',
    flexDirection: 'column-reverse',
    justifyContent: 'space-between',
    padding: theme.spacing(1),
  }));

  return (
    <Box display="flex" flexDirection="column" alignItems="center" padding={1}>
      <Typography fontWeight="bold">Burnt level color</Typography>
      <GradientBar>
        {colorIntensityArray.map((item, index) => (
          <Box
            key={index}
            width="100%"
            height={`${100 / colorIntensityArray.length}%`}
            bgcolor={item.color}
          >
            {index === 0 || index === colorIntensityArray.length - 1 ? (
              <center>
                <Typography fontWeight="bold" variant="body2">
                  {index + 1} {index === 0 ? 'time' : 'times +'}
                </Typography>
              </center>
            ) : null}
          </Box>
        ))}
      </GradientBar>
    </Box>
  );
};

export default ColorBar;
