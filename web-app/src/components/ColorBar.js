import React from 'react';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';
import { styled } from '@mui/system';
import { useSelector } from 'react-redux';

const ColorBar = () => {
  const max_freq = useSelector(state => state.burnScar.max);

  // Calculate the step size for fillOpacity
  const stepSize = 1 / max_freq;

  // Adjust colorIntensityArray dynamically based on stepSize
  const colorIntensityArray = [
    { fillOpacity: stepSize * 0.2, color: '#FFCCCC' },
    { fillOpacity: stepSize * 0.3, color: '#FFB2B2' },
    { fillOpacity: stepSize * 0.4, color: '#FF9999' },
    { fillOpacity: stepSize * 0.5, color: '#FF7F7F' },
    { fillOpacity: stepSize * 0.6, color: '#FF6666' },
    { fillOpacity: stepSize * 0.7, color: '#FF4C4C' },
    { fillOpacity: stepSize * 0.8, color: '#FF3232' },
    { fillOpacity: stepSize * 0.9, color: '#FF1919' },
    { fillOpacity: stepSize * 1.0, color: '#FF0000' }
  ];

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
            style={{ opacity: item.fillOpacity }}
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
