import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Select, MenuItem, Typography, Switch, FormControl, FormLabel, FormHelperText, Stack, Divider, Button
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { saveLayerSettings, setLoadingMap, getCities } from '../reducers/uiSlice';
import { fetchBurntScarPolygon, fetchBurntScarData } from '../reducers/burntScarSlice';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const countries = [
  { name: 'Thailand', value: 'Thailand' },
  { name: 'Myanmar', value: 'Myanmar' },
  { name: 'Laos', value: 'Laos' },
  { name: 'Vietnam', value: 'Vietnam' }
];

function FilterCard() {
  const dispatch = useDispatch();
  const ui = useSelector(state => state.ui);
  const cities = useSelector(state => state.ui ? state.ui.cities : []);
  const [country, setCountry] = useState(ui.sidebarForm.country);
  const [city, setCity] = useState(ui.sidebarForm.city);
  const [burntScar, setBurntScar] = useState(ui.burntScar);
  const [aqi, setAqi] = useState(ui.aqi);
  const [hotSpot, setHotSpot] = useState(ui.hotSpot);
  const [burntScarPoint, setBurntScarPoint] = useState(ui.burntScarPoint);
  const [date, setDate] = useState(ui.sidebarForm.date);
  const [startDate, setStartDate] = useState(ui.sidebarForm.startDate);
  const [endDate, setEndDate] = useState(ui.sidebarForm.endDate);

  useEffect(() => {
    if (country && country !== 'pls') {
      dispatch(getCities(country));
    }
  }, [country, dispatch]);

  const handleStartDateChange = (date) => {
    setStartDate(date.format('YYYY-MM-DD'));
  };

  const handleEndDateChange = (date) => {
    setEndDate(date.format('YYYY-MM-DD'));
  };

  const handleCountryChange = (event) => {
    setCountry(event.target.value);
    setCity('All');
  };

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  const handleChange = (event) => {
    switch (event.target.name) {
      case 'burntScar':
        setBurntScar(event.target.checked);
        setAqi(false);
        setHotSpot(false);
        setBurntScarPoint(false);
        break;
      case 'burntScarPoint':
        setBurntScarPoint(event.target.checked);
        setAqi(false);
        setHotSpot(false);
        setBurntScar(false);
        break;
      case 'aqi':
        setAqi(event.target.checked);
        setBurntScar(false);
        setHotSpot(false);
        setBurntScarPoint(false);
        break;
      case 'hotSpot':
        setHotSpot(event.target.checked);
        setBurntScar(false);
        setAqi(false);
        setBurntScarPoint(false);
        break;
      default:
        break;
    }
  };

  const handleSave = () => {
    const sidebarForm = {
      country: country,
      city: city,
      date: date,
      startDate: startDate,
      endDate: endDate
    };

    let current_lat, current_lng;

    if (city === 'All' || country === 'All') {
      current_lat = '19.9094';
      current_lng = '99.8275';
    } else {
      const filteredCity = cities.find(item => item.city === city);
      current_lat = filteredCity ? filteredCity.lat : '19.9094';
      current_lng = filteredCity ? filteredCity.lng : '99.8275';
    }

    dispatch(saveLayerSettings({ sidebarForm, burntScar, aqi, hotSpot, burntScarPoint, current_lat, current_lng }));

    if (burntScar) {
      dispatch(setLoadingMap(true));
      dispatch(fetchBurntScarPolygon(sidebarForm))
        .finally(() => {
          dispatch(setLoadingMap(false));
        });
    }
    if (burntScarPoint) {
      dispatch(setLoadingMap(true));
      dispatch(fetchBurntScarData(sidebarForm))
        .finally(() => {
          dispatch(setLoadingMap(false));
        });
    }
  };

  return (
    <Card sx={{ backgroundColor: '#fff', padding: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Divider />
        <FormControl fullWidth margin="normal">
          <FormLabel>Country</FormLabel>
          <Select value={country} onChange={handleCountryChange}>
            <MenuItem value="All">Select all</MenuItem>
            {countries.map((country) => (
              <MenuItem key={country.value} value={country.value}>
                {country.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <FormLabel>City</FormLabel>
          <Select value={city} onChange={handleCityChange}>
            <MenuItem value="All">Select all</MenuItem>
            {cities.map((city) => (
              <MenuItem key={city.city} value={city.city}>
                {city.city}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <FormControl fullWidth margin="normal">
            <FormLabel>Start Date</FormLabel>
            <DatePicker value={dayjs(startDate)} onChange={handleStartDateChange} />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <FormLabel>End Date</FormLabel>
            <DatePicker value={dayjs(endDate)} onChange={handleEndDateChange} />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <FormLabel>Date</FormLabel>
            <DatePicker value={dayjs(date)} onChange={(newValue) => setDate(newValue.format('YYYY-MM-DD'))} />
          </FormControl>
        </LocalizationProvider>
        <FormControl fullWidth margin="normal">
          <FormLabel>Map Layer</FormLabel>
          <FormControl fullWidth margin="normal">
            <FormLabel>Burnt Level Layer (Area-based)</FormLabel>
            <Switch checked={burntScar} onChange={handleChange} name="burntScar" />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <FormLabel>Air quality layer</FormLabel>
            <Switch checked={aqi} onChange={handleChange} name="aqi" />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <FormLabel>Hotspot layer</FormLabel>
            <Switch checked={hotSpot} onChange={handleChange} name="hotSpot" />
          </FormControl>
        </FormControl>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Submit
        </Button>
      </CardContent>
    </Card>
  );
}

export default FilterCard;
