import React from 'react';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';
import { styled } from '@mui/system';

const aqiColors = [
  { range: '0-50', color: '#50C9F4' },
  { range: '51-100', color: '#78C150' },
  { range: '101-200', color: '#FFF46B' },
  { range: '201-300', color: '#F89836' },
  { range: '301-500', color: '#EC363A' },
];

const AirQualityColorBar = () => {
  const GradientBar = styled('div')(({ theme }) => ({
    height: '30vh',
    display: 'flex',
    flexDirection: 'column-reverse',
    justifyContent: 'space-between',
    padding: theme.spacing(1),
  }));

  return (
    <Box display="flex" flexDirection="column" alignItems="center" padding={1}>
      <Typography fontWeight="bold">Air Quality Index (AQI) Levels</Typography>
      <GradientBar>
        {aqiColors.map((item, index) => (
          <Box
            key={index}
            width="100%"
            height={`${100 / aqiColors.length}%`}
            bgcolor={item.color}
          >
            <center>
              <Typography fontWeight="bold" variant="body2">
                {item.range}
              </Typography>
            </center>
          </Box>
        ))}
      </GradientBar>
    </Box>
  );
};

export default AirQualityColorBar;
