import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Select, MenuItem, Typography, Switch, FormControl, FormLabel, Divider, InputLabel, Button
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { saveLayerSettings, setLoadingMap, fetchProvinceByCountry } from '../reducers/uiSlice';
import { fetchBurntScarPolygon, fetchBurntScarData } from '../reducers/burntScarSlice';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

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
  const dataProvince = useSelector((state) => state.ui.dataProvince ?? []);
  const [country, setCountry] = useState(ui.sidebarForm.country);
  const [province, setProvince] = useState(ui.sidebarForm.province);
  const [city, setCity] = useState(ui.sidebarForm.city);
  const [burntScar, setBurntScar] = useState(ui.burntScar);
  const [aqi, setAqi] = useState(ui.aqi);
  const [hotSpot, setHotSpot] = useState(ui.hotSpot);
  const [burntScarPoint, setBurntScarPoint] = useState(ui.burntScarPoint);
  const [date, setDate] = useState(ui.sidebarForm.date);
  const [startDate, setStartDate] = useState(ui.sidebarForm.startDate);
  const [endDate, setEndDate] = useState(ui.sidebarForm.endDate);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (country) {
      dispatch(setLoadingMap(true));
      dispatch(fetchProvinceByCountry({country: country, module:'burnscar'}))
      .finally(() => {
        dispatch(setLoadingMap(false));
      });
    }
  }, [country, dispatch]);

  const handleStartDateChange = (date) => {
    setStartDate(date.format('YYYY-MM-DD'));
  };

  const handleEndDateChange = (date) => {
    setEndDate(date.format('YYYY-MM-DD'));
  };

  const handleChangeCountry = (event) => {
    setCountry(event.target.value);
    setProvince('ALL')
  };

  const handleChangeProvince = (event) => {
    setProvince(event.target.value);
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
    <Card sx={{ backgroundColor: '#fff', height: '100%', padding: isSmallScreen ? 1 : 2, overflow: 'auto' }}>
      <CardContent>
        <Typography level="title-md" fontWeight="bold" sx={{ mt: 2 }} gutterBottom>
          Filters
        </Typography>
        <Divider />
        <Typography level="title-md"  sx={{ mt: 2 }}>
          Area
        </Typography>
        <FormControl fullWidth margin="normal" sx={{ mt: isSmallScreen ? 1 : 2 }} size="small">
        <InputLabel id="country-select-label">Country</InputLabel>
          <Select 
            labelId="country-select-label"
            label="Country"
            value={country} 
            onChange={(event) => handleChangeCountry(event)}
            sx={{ fontSize: isSmallScreen ? '0.75rem' : '1rem' }}
          >
            <MenuItem value={"ALL"}><em>All</em></MenuItem>
            <MenuItem value={"THA"}>Thailand</MenuItem>
            <MenuItem value={"VNM"}>Vietnam</MenuItem>
            <MenuItem value={"MMR"}>Myanmar</MenuItem>
            <MenuItem value={"LAO"}>Laos</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal" sx={{ mt: isSmallScreen ? 1 : 2 }} size="small">
          <InputLabel id="province-select-label">Province</InputLabel>
          <Select 
            labelId="province-select-label"
            label="Province"
            value={province} 
            onChange={(event) => handleChangeProvince(event)}
            sx={{ fontSize: isSmallScreen ? '0.75rem' : '1rem' }}
          >
            <MenuItem key={"ALL"} value={"ALL"}><em>All</em></MenuItem>
            {dataProvince.map((pv_en) => (
              <MenuItem key={pv_en.PV_EN} value={pv_en.PV_EN}>
                {pv_en.PV_EN}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {(burntScar === true) && (
          <Typography level="title-md"  sx={{ mt: 2 }}>
            Date Range
          </Typography>
        )}
        {(hotSpot === true || aqi === true) && (
          <Typography level="title-md"  sx={{ mt: 2 }}>
            Select Date
          </Typography>
        )}
        {(burntScar === true) && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <FormControl fullWidth margin="normal" sx={{ mt: isSmallScreen ? 1 : 2 }}>
              <DatePicker 
                label="Start Date"
                value={dayjs(startDate)} 
                onChange={handleStartDateChange} 
                sx={{ fontSize: isSmallScreen ? '0.75rem' : '1rem' }}
                slotProps={{ textField: { size: 'small' }, InputProps: { readOnly: true } }}
                maxDate={dayjs(new Date())}
              />
            </FormControl>
            <FormControl fullWidth margin="normal" sx={{ mt: isSmallScreen ? 1 : 2 }}>
              <DatePicker 
                label="End Date"
                value={dayjs(endDate)} 
                onChange={handleEndDateChange} 
                sx={{ fontSize: isSmallScreen ? '0.75rem' : '1rem' }}
                slotProps={{ textField: { size: 'small' }, InputProps: { readOnly: true } }}
                minDate={dayjs(startDate)}
                maxDate={dayjs(new Date())}
              />
            </FormControl>
          </LocalizationProvider>
        )}
        {(hotSpot === true || aqi === true) && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <FormControl fullWidth margin="normal" sx={{ mt: isSmallScreen ? 1 : 2 }}>
              <DatePicker 
                label="Date"
                value={dayjs(date)} 
                onChange={(newValue) => setDate(newValue.format('YYYY-MM-DD'))} 
                sx={{ fontSize: isSmallScreen ? '0.75rem' : '1rem' }}
                slotProps={{ textField: { size: 'small' }, InputProps: { readOnly: true } }}
                maxDate={dayjs(new Date())}
              />
            </FormControl>
          </LocalizationProvider>
         )}
        <FormControl fullWidth margin="normal" sx={{ mt: isSmallScreen ? 1 : 2 }}>
          <FormLabel>Map Layer</FormLabel>
          <FormControl fullWidth margin="normal" sx={{ mt: isSmallScreen ? 1 : 2 }}>
            <FormLabel>Burnt Level Layer (Area-based)</FormLabel>
            <Switch 
              checked={burntScar} 
              onChange={handleChange} 
              name="burntScar" 
              sx={{ transform: isSmallScreen ? 'scale(0.75)' : 'scale(1)' }}
            />
          </FormControl>
          <FormControl fullWidth margin="normal" sx={{ mt: isSmallScreen ? 1 : 2 }}>
            <FormLabel>Air quality layer</FormLabel>
            <Switch 
              checked={aqi} 
              onChange={handleChange} 
              name="aqi" 
              sx={{ transform: isSmallScreen ? 'scale(0.75)' : 'scale(1)' }}
            />
          </FormControl>
          <FormControl fullWidth margin="normal" sx={{ mt: isSmallScreen ? 1 : 2 }}>
            <FormLabel>Hotspot layer</FormLabel>
            <Switch 
              checked={hotSpot} 
              onChange={handleChange} 
              name="hotSpot" 
              sx={{ transform: isSmallScreen ? 'scale(0.75)' : 'scale(1)' }}
            />
          </FormControl>
        </FormControl>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: isSmallScreen ? 1 : 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSave}
            sx={{ fontSize: isSmallScreen ? '0.75rem' : '1rem' }}
          >
            Submit
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default FilterCard;
