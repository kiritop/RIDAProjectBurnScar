// Sidebar.js
import React, { useState } from 'react'

import Box from '@mui/joy/Box';
import Drawer from '@mui/joy/Drawer';
import Button from '@mui/joy/Button';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import ModalClose from '@mui/joy/ModalClose';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import Slider from "@mui/material/Slider";
import { Select, Switch, MenuItem } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { saveLayerSettings } from '../reducers/uiSlice';

const countries = ['Select all','Thailand', 'Myanmar', 'Laos', 'Vietnam'];
const provinces = ['Chiang Rai', 'Chiang Mai', 'Lampang', 'Lamphun', 'Mae Hong Son', 'Nan', 'Phayao', 'Phrae', 'Uttaradit'];

export default function Sidebar({ isOpen , toggleDrawer}) {

  const ui = useSelector(state => state.ui);

  const [yearRange, setYearRange] = React.useState(ui.sidebarForm.yearRange);
  const [country, setCountry] = React.useState(ui.sidebarForm.country);
  const [province, setProvince] = React.useState(ui.sidebarForm.province);
  const [burntScar, setBurntScar] = useState(ui.burntScar);
  const [aqi, setAqi] = useState(ui.aqi);
  const [hotSpot, setHotSpot] = useState(ui.hotSpot);
  const dispatch = useDispatch();

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // เดือนเริ่มต้นที่ 0
  const day = String(currentDate.getDate()).padStart(2, '0');

  const handleCountryChange = (event) => {
    setCountry(event.target.value);
  };

  const handleProvinceChange = (event) => {
    setProvince(event.target.value);
  };

  //set year range 
  const handleYearChange = (event, newValue) => {
    setYearRange(newValue);
  };



  const handleChange = (event) => {
    switch (event.target.name) {
      case 'burntScar':
        setBurntScar(event.target.checked);
        setAqi(false);
        setHotSpot(false);
        break;
      case 'aqi':
        setAqi(event.target.checked);
        setBurntScar(false);
        setHotSpot(false);
        break;
      case 'hotSpot':
        setHotSpot(event.target.checked);
        setBurntScar(false);
        setAqi(false);
        break;
      default:
        break;
    }
    console.log("event.target.name", event.target.name);
    console.log("event.target.checked", event.target.checked);
  };

  const handleSave = () => {
    const sidebarForm = {
      yearRange : yearRange,
      country : country,
      province : province
    }
    // Dispatch the save action with the current state
    dispatch(saveLayerSettings({ sidebarForm, burntScar, aqi, hotSpot }));
    toggleDrawer(); 
  };



  return (
    <Drawer
    size="sm"
    anchor="right"
    variant="plain"
    open={isOpen}
    onClose={toggleDrawer}
    slotProps={{
      content: {
        sx: {
          bgcolor: 'transparent',
          p: { md: 3, sm: 0 },
          boxShadow: 'none',
        },
      },
    }}
  >
    <Sheet
      sx={{
        borderRadius: 'md',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: '100%',
        overflow: 'auto',
      }}
    >
      <DialogTitle>Filters</DialogTitle>
      <ModalClose />
      <Divider sx={{ mt: 'auto' }} />
      <DialogContent sx={{ gap: 2 }}>

      {burntScar === true && (<Typography level="title-md" fontWeight="bold" sx={{ mt: 2 }}>
          Year Range
        </Typography>)}

        <FormControl orientation="horizontal">
          <Box sx={{ flex: 1, pr: 1 }}>
            <Stack spacing={2} direction="row" alignItems="center">
            {burntScar === true && (<Slider
                value={yearRange}
                onChange={handleYearChange}
                valueLabelDisplay="on"
                min={year-5}
                max={year+5}
                step={1}
                // sx={{color: '#50C1DD' }}
              />)}
            </Stack>
          </Box>
        </FormControl>

        {burntScar === true && (<Typography level="title-md" fontWeight="bold" sx={{ mt: 2 }}>
          Country
        </Typography>)}
        <FormControl orientation="horizontal">
          <Box sx={{ flex: 1, pr: 1 }}>
            <Stack spacing={2}>
            {burntScar === true && (<Select value={country} onChange={handleCountryChange}>
                {countries.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>)}
            </Stack>
          </Box>
        </FormControl>
          
        {country === 'Thailand' && burntScar === true && (<Typography level="title-md" fontWeight="bold" sx={{ mt: 2 }}>
          State
        </Typography>)}
        <FormControl orientation="horizontal">
          <Box sx={{ flex: 1, pr: 1 }}>
            <Stack spacing={2}>
              {country === 'Thailand' && burntScar === true && (
                  <Select value={province} onChange={handleProvinceChange}>
                    {provinces.map((province) => (
                      <MenuItem key={province} value={province}>
                        {province}
                      </MenuItem>
                    ))}
                  </Select>
              )}
            </Stack>
          </Box>
        </FormControl>

        <Typography level="title-md" fontWeight="bold" sx={{ mt: 2 }}>
          Map Layer
        </Typography>
        <FormControl orientation="horizontal">
          <Box sx={{ flex: 1, mt: 1, mr: 1  }}>
            <FormLabel sx={{ typography: 'title-sm' }}>Burnt Level Layer</FormLabel>
            {/* <FormHelperText sx={{ typography: 'body-sm' }}>
              Description for burnt level map
            </FormHelperText> */}
          </Box>
          <Switch checked={burntScar} onChange={handleChange} name="burntScar" />
        </FormControl>

        <FormControl orientation="horizontal">
          <Box sx={{ flex: 1, mt: 1, mr: 1 }}>
            <FormLabel sx={{ typography: 'title-sm' }}>PM 2.5 layer</FormLabel>
            <FormHelperText sx={{ typography: 'body-sm' }}>
              On {month}/{day}/{year}
            </FormHelperText>
          </Box>
          <Switch checked={aqi} onChange={handleChange} name="aqi" />
        </FormControl>

        <FormControl orientation="horizontal">
          <Box sx={{ flex: 1, mt: 1, mr: 1 }}>
            <FormLabel sx={{ typography: 'title-sm' }}>Hotspot layer</FormLabel>
            <FormHelperText sx={{ typography: 'body-sm' }}>
              On {month}/{day}/{year}
            </FormHelperText>
          </Box>
          <Switch checked={hotSpot} onChange={handleChange} name="hotSpot" />
        </FormControl>
      </DialogContent>

      <Divider sx={{ mt: 'auto' }} />
      <Stack
        direction="row"
        justifyContent="space-between"
        useFlexGap
        spacing={1}
      >
        {/* <Button
          variant="outlined"
          color="neutral"
          onClick={() => {

          }}
        >
          Clear
        </Button> */}
        <Box sx={{ flex: 1, mt: 1, mr: 1 }}/>
        <Button onClick={handleSave} >Save</Button>
      </Stack>
    </Sheet>
  </Drawer>
  );
}