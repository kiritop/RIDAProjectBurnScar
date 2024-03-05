// Sidebar.js
import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Switch, FormControlLabel, Slider, MenuItem, InputLabel, FormControl, TextField, Typography, Grid, Card, CardContent, Button, Box } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';

export default function Sidebar({ isOpen , toggleDrawer}) {

  const [year, setYear] = React.useState(2022);
  const colors = ['lightorange', 'orange', 'darkorange', 'orangered', 'red', 'darkred'];

  const handleSliderChange = (event, newValue) => {
    setYear(newValue);
  };

  return (
    <Drawer anchor="right" open={isOpen} onClose={toggleDrawer}>
      <List>
        <ListItem>
          <ListItemIcon>
            <MapIcon />
          </ListItemIcon>
          <ListItemText primary="Burned Scar" />
          <Switch />
        </ListItem>
        <ListItem>
          <ListItemText primary="Display burned recurring rate (Time)" />
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5, 6].map((value, index) => (
              <Grid item key={value}>
                <Button variant="text" style={{backgroundColor: colors[index]}}>
                  {value.toString()}
                </Button>
              </Grid>
            ))}
          </Grid>
        </ListItem>
        <ListItem>
          <Typography id="year-slider" gutterBottom>
            Year
          </Typography>
          <Slider
            value={year}
            onChange={handleSliderChange}
            aria-labelledby="year-slider"
            valueLabelDisplay="auto"
            step={1}
            marks
            min={2019}
            max={2024}
          />
        </ListItem>
      </List>
    </Drawer>
  );
}