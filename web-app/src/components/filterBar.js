import React from 'react';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';
import { styled } from '@mui/system';
import { useSelector } from 'react-redux';

const FilterBar = () => {
  const {sidebarForm, hotSpot, aqi, burntScar, burntScarPoint } = useSelector(state => state.ui);

  // Calculate the step size for fillOpacity

  return (
    <Box display="flex" flexDirection="column" alignItems="center" padding={1}>
          <Box
            key="SideBar"
            width="100%"
            height='200'
          >
              
                {(burntScar === true || burntScarPoint === true) &&<Typography fontWeight="bold" variant="body2">
                  Start Date : {sidebarForm.startDate}
                </Typography>
                }
                {(burntScar === true || burntScarPoint === true) &&<Typography fontWeight="bold" variant="body2">
                  End Date : {sidebarForm.endDate}
                </Typography>
                }
                {(hotSpot === true || aqi === true) &&<Typography fontWeight="bold" variant="body2">
                  Date : {sidebarForm.date}
                </Typography>
                }
                <Typography fontWeight="bold" variant="body2">
                  Country : {sidebarForm.country}
                </Typography>
                <Typography fontWeight="bold" variant="body2">
                  Province : {sidebarForm.city}
                </Typography>
          </Box>
    </Box>
  );
};

export default FilterBar;
