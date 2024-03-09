// Sidebar.js
import * as React from 'react';

import Box from '@mui/joy/Box';
import Drawer from '@mui/joy/Drawer';
import Button from '@mui/joy/Button';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import ModalClose from '@mui/joy/ModalClose';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Switch from '@mui/joy/Switch';
import Typography from '@mui/joy/Typography';
import Slider from "@mui/material/Slider";

const countries = ['Thailand', 'Myanmar', 'Laos', 'Vietnam', 'Cambodia'];
const provinces = ['Chiang Rai', 'Chiang Mai', 'Lampang', 'Lamphun', 'Mae Hong Son', 'Nan', 'Phayao', 'Phrae', 'Uttaradit'];

export default function Sidebar({ isOpen , toggleDrawer}) {

  const [year, setYear] = React.useState(2022);
  const colors = ['#feb9b9', '#f88', '#ff5757', '#ff2626', '#f40000', '#c30000', '#920000', '#610000', '#300000'];
  const [type, setType] = React.useState('Guesthouse');
  const [amenities, setAmenities] = React.useState([0, 6]);
  const [yearRange, setYearRange] = React.useState([2019, 2023]);
  const [country, setCountry] = React.useState('Thailand');
  const [province, setProvince] = React.useState('Chiang Rai');

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

        <Typography level="title-md" fontWeight="bold" sx={{ mt: 2 }}>
          Year Range
        </Typography>

        <FormControl orientation="horizontal">
          <Box sx={{ flex: 1, pr: 1 }}>
            <Stack spacing={2} direction="row" alignItems="center">
              <Slider
                value={yearRange}
                onChange={handleYearChange}
                valueLabelDisplay="on"
                min={2017}
                max={2024}
                step={1}
                sx={{color: '#ae1b1f' }}
              />
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
                  <Option key={country} value={country}>
                    {country}
                  </Option>
                ))}
              </Select>
            </Stack>
          </Box>
        </FormControl>
        
        <Typography level="title-md" fontWeight="bold" sx={{ mt: 2 }}>
          Province
        </Typography>
        <FormControl orientation="horizontal">
          <Box sx={{ flex: 1, pr: 1 }}>
            <Stack spacing={2}>
              {country === 'Thailand' && (
                  <Select value={province} onChange={handleProvinceChange}>
                    {provinces.map((province) => (
                      <Option key={province} value={province}>
                        {province}
                      </Option>
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
          <Box sx={{ flex: 1, pr: 1 }}>
            <FormLabel sx={{ typography: 'title-sm' }}>
              Burnt Scar Layer
            </FormLabel>
            <FormHelperText sx={{ typography: 'body-sm' }}>
              Description for burn scar map
            </FormHelperText>
          </Box>
          <Switch color="warning" checked/>
        </FormControl>

        <FormControl orientation="horizontal">
          <Box sx={{ flex: 1, mt: 1, mr: 1 }}>
            <FormLabel sx={{ typography: 'title-sm' }}>Aqi Layer</FormLabel>
            <FormHelperText sx={{ typography: 'body-sm' }}>
            Description for PM 2.5
            </FormHelperText>
          </Box>
          <Switch color="warning" />
        </FormControl>

        <FormControl orientation="horizontal">
          <Box sx={{ flex: 1, mt: 1, mr: 1 }}>
            <FormLabel sx={{ typography: 'title-sm' }}>Hot spot layer</FormLabel>
            <FormHelperText sx={{ typography: 'body-sm' }}>
            Description for Hot spot
            </FormHelperText>
          </Box>
          <Switch color="warning" />
        </FormControl>
      </DialogContent>

      <Divider sx={{ mt: 'auto' }} />
      <Stack
        direction="row"
        justifyContent="space-between"
        useFlexGap
        spacing={1}
      >
        <Button
          variant="outlined"
          color="neutral"
          onClick={() => {
            setType('');
            setAmenities([]);
          }}
        >
          Clear
        </Button>
        <Button onClick={toggleDrawer}>Save</Button>
      </Stack>
    </Sheet>
  </Drawer>
  );
}