// Sidebar.js
import React, { useState, useEffect } from 'react'

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
import { saveLayerSettings, setLoadingMap, getCities } from '../reducers/uiSlice';
import { fetchBurntScarData } from '../reducers/burntScarSlice';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const countries = [
                    { 
                      name:'Select all',
                      value: 'All',
                      iso3:"",
                      lat:'19.9094',
                      lng:'99.8275'
                    },
                    { 
                      name:'Thailand',
                      value: 'Thailand',
                      iso3:"THA",
                      lat:'19.9094',
                      lng:'99.8275'
                    },
                    { 
                      name:'Myanmar',
                      value: 'Myanmar',
                      iso3:"MMR",
                      lat:'16.871311',
                      lng:'96.199379'
                    },
                    { 
                      name:'Laos',
                      value: 'Laos',
                      iso3:"LAO",
                      lat:'19.889271',
                      lng:'102.133453'
                    },
                    { 
                      name:'Vietnam',
                      value: 'Vietnam',
                      iso3:"VNM",
                      lat:'21.028511',
                      lng:'105.804817'
                    }
                  ];

export default function Sidebar({ isOpen , toggleDrawer}) {

  const ui = useSelector(state => state.ui);

  const [yearRange, setYearRange] = useState(ui.sidebarForm.yearRange);
  const [country, setCountry] = useState(ui.sidebarForm.country);
  const [city, setCity] = useState(ui.sidebarForm.city);
  const [burntScar, setBurntScar] = useState(ui.burntScar);
  const [aqi, setAqi] = useState(ui.aqi);
  const [hotSpot, setHotSpot] = useState(ui.hotSpot);
  const dispatch = useDispatch();

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // เดือนเริ่มต้นที่ 0
  const day = String(currentDate.getDate()).padStart(2, '0');

  const cities = useSelector((state) => state.ui ? state.ui.cities : []);
  const [date, setDate] = useState(ui.sidebarForm.date);

  const handleCountryChange = (event) => {
    setCountry(event.target.value);
    setCity('All');
  };

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  //set year range 
  const handleYearChange = (event, newValue) => {
    setYearRange(newValue);
  };

  useEffect(() => {
    if (country) {
      dispatch(getCities(country));
    }
  }, [country, dispatch]);



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

    let valueFilter = country
    const country_filter = countries.find((country) => country.value === valueFilter);
    const iso3 = country_filter ? country_filter.iso3 : null;

    const sidebarForm = {
      yearRange : yearRange,
      country : country,
      city : city,
      date : date,
      iso3: iso3
    }
    if(city === "All" || valueFilter ==="All"){
      let filteredCountries = countries.filter(country => country.value === valueFilter);
      let current_lat = filteredCountries[0].lat
      let current_lng = filteredCountries[0].lng
      // Dispatch the save action with the current state
      dispatch(saveLayerSettings({ sidebarForm, burntScar, aqi, hotSpot, current_lat, current_lng}));
    }else{
      let valueToFilter = city
      let filteredCountries = cities.filter(city => city.city === valueToFilter);
      let current_lat = filteredCountries[0].lat
      let current_lng = filteredCountries[0].lng
      // Dispatch the save action with the current state
      dispatch(saveLayerSettings({ sidebarForm, burntScar, aqi, hotSpot, current_lat, current_lng}));
    }
    
    // if(burntScar){
    //   dispatch(setLoadingMap(true));
    //   dispatch(fetchBurntScarData(sidebarForm))
    //   .finally(() => {
    //     dispatch(setLoadingMap(false));
    //   });
    // }
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

        <Typography level="title-md" fontWeight="bold" sx={{ mt: 2 }}>
          Country
        </Typography>
        <FormControl orientation="horizontal">
          <Box sx={{ flex: 1, pr: 1 }}>
            <Stack spacing={2}>
            <Select value={country} onChange={handleCountryChange}>
                {countries.map((country) => (
                  <MenuItem key={country.value} value={country.value}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          </Box>
        </FormControl>
          
        {country !== 'All' && (<Typography level="title-md" fontWeight="bold" sx={{ mt: 2 }}>
          State
        </Typography>)}
        <FormControl orientation="horizontal">
          <Box sx={{ flex: 1, pr: 1 }}>
            <Stack spacing={2}>
              {country !== 'All' && (
                  <Select value={city} onChange={handleCityChange}>
                    <MenuItem value="All">Select All</MenuItem>
                    {cities.map((city) => (
                      <MenuItem key={city.city} value={city.city}>
                        {city.city}
                      </MenuItem>
                    ))}
                  </Select>
              )}
            </Stack>
          </Box>
        </FormControl>

        {burntScar === false && aqi === false &&(<Typography level="title-md" fontWeight="bold" sx={{ mt: 2 }}>
          Date
        </Typography>)}
        <FormControl orientation="horizontal">
          <Box sx={{ flex: 1, pr: 1 }}>
            <Stack spacing={2}>
              {burntScar === false && aqi === false &&(
                 <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={['DatePicker']}>
                    <DatePicker 
                      label="Choose Date" 
                      value={dayjs(date)}  
                      sx={{ flexGrow: 1 }} 
                      onChange={(newValue) => setDate(newValue.format('YYYY-MM-DD'))}
                    />
                  </DemoContainer>
                </LocalizationProvider>
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
              On {dayjs(date).format('MM/DD/YYYY')}
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
        <Button onClick={handleSave} >Submit</Button>
      </Stack>
    </Sheet>
  </Drawer>
  );
}