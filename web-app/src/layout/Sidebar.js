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
import { saveLayerSettings, setLoadingMap } from '../reducers/uiSlice';
import { fetchBurntScarData } from '../reducers/burntScarSlice';

const countries = [
                    { 
                      name:'Select all',
                      value: 'All',
                      lat:'13.736717',
                      lng:'100.523186'
                    },
                    { 
                      name:'Thailand',
                      value: 'Thailand',
                      lat:'13.736717',
                      lng:'100.523186'
                    },
                    { 
                      name:'Myanmar',
                      value: 'Myanmar',
                      lat:'16.871311',
                      lng:'96.199379'
                    },
                    { 
                      name:'Laos',
                      value: 'Laos',
                      lat:'19.889271',
                      lng:'102.133453'
                    },
                    { 
                      name:'Vietnam',
                      value: 'Vietnam',
                      lat:'21.028511',
                      lng:'105.804817'
                    }
                  ];
const provinces = [
                    { 
                      name:'Select all',
                      value: 'All',
                      lat:'13.736717',
                      lng:'100.523186'
                    },
                    { 
                      name:'Chiang Mai',
                      value: 'Chiang Mai',
                      lat: "18.7889", 
                      lng: "98.9833", 
                    },
                    { 
                      name:'Chiang Rai',
                      value: 'Chiang Rai',
                      lat: "19.9094", 
                      lng: "99.8275", 
                    },
                    { 
                      name:'Lampang',
                      value: 'Lampang',
                      lat: "18.3000", 
                      lng: "99.5000", 
                    },
                    { 
                      name:'Lamphun',
                      value: 'Lamphun',
                      lat: "18.5865", 
                      lng: "99.0121", 
                    },
                    { 
                      name:'Mae Hong Son',
                      value: 'Mae Hong Son',
                      lat: "19.3011", 
                      lng: "97.9700", 
                    },
                    { 
                      name:'Nan',
                      value: 'Nan',
                      lat: "18.7893", 
                      lng: "100.7766", 
                    },
                    { 
                      name:'Phayao',
                      value: 'Phayao',
                      lat: "19.1652", 
                      lng: "99.9036",
                    },
                    { 
                      name:'Phrae',
                      value: 'Phrae',
                      lat: "18.1436", 
                      lng: "100.1417", 
                    },
                    { 
                      name:'Uttaradit',
                      value: 'Uttaradit',
                      lat: "17.6256", 
                      lng: "100.0942", 
                    },
                  ];

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
  };

  const handleSave = () => {
    const sidebarForm = {
      yearRange : yearRange,
      country : country,
      province : province
    }
    
    if(province == "All"){
      let valueToFilter = country
      let filteredCountries = countries.filter(country => country.value === valueToFilter);
      let current_lat = filteredCountries[0].lat
      let current_lng = filteredCountries[0].lng
      // Dispatch the save action with the current state
      dispatch(saveLayerSettings({ sidebarForm, burntScar, aqi, hotSpot, current_lat, current_lng }));
    }else{
      let valueToFilter = province
      let filteredCountries = provinces.filter(state => state.value === valueToFilter);
      let current_lat = filteredCountries[0].lat
      let current_lng = filteredCountries[0].lng
      // Dispatch the save action with the current state
      dispatch(saveLayerSettings({ sidebarForm, burntScar, aqi, hotSpot, current_lat, current_lng }));
    }


    
    if(burntScar){
      dispatch(setLoadingMap(true));
      dispatch(fetchBurntScarData(sidebarForm))
      .finally(() => {
        dispatch(setLoadingMap(false));
      });
    }
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
                max={year}
                step={1}
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
                  <MenuItem key={country.value} value={country.value}>
                    {country.name}
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
                      <MenuItem key={province.value} value={province.value}>
                        {province.name}
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