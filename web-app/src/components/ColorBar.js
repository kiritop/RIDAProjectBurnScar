import React from 'react';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';
import { styled } from '@mui/system';
import { useSelector } from 'react-redux';

const ColorBar = () => {
  const max_freq = useSelector(state => state.burnScar.max);

  // Generate colorIntensityArray dynamically based on max_freq
  const generateColorIntensityArray = (max_freq) => {
    const colors = ['#FFCCCC', '#FFB2B2', '#FF9999', '#FF7F7F', '#FF6666', '#FF4C4C', '#FF3232', '#FF1919', '#FF0000'];
    const intensityArray = [];

    if (max_freq === 1) {
      intensityArray.push({ fillOpacity: 0.5, color: colors[4] });
      intensityArray.push({ fillOpacity: 1.0, color: colors[8] });
    } else {
      const stepSize = 1 / max_freq;
      for (let i = 1; i <= max_freq; i++) {
        intensityArray.push({
          fillOpacity: stepSize * i,
          color: i === max_freq ? '#FF0000' : colors[Math.floor((i - 1) * (colors.length - 1) / (max_freq - 1))]
        });
      }
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
