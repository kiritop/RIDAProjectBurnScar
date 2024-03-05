import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import InfoIcon from '@mui/icons-material/Info';
import ArticleIcon from '@mui/icons-material/Article';

export default function Header() {
  return (
    <AppBar position="static" style={{ backgroundColor: '#FFFFFF' }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton color="inherit">
          <MapIcon style={{ color: '#0093FF' }} />
          <Typography variant="h6" component="div" style={{ color: '#0093FF' }}>
            Map
          </Typography>
        </IconButton>
        <IconButton color="inherit">
          <ShoppingBagIcon style={{ color: '#0093FF' }} />
          <Typography variant="h6" component="div" style={{ color: '#0093FF' }}>
            Service
          </Typography>
        </IconButton>
        <IconButton color="inherit">
          <InfoIcon style={{ color: '#0093FF' }} />
          <Typography variant="h6" component="div" style={{ color: '#0093FF' }}>
            About us
          </Typography>
        </IconButton>
        <IconButton color="inherit">
          <ArticleIcon style={{ color: '#0093FF' }} />
          <Typography variant="h6" component="div" style={{ color: '#0093FF' }}>
            Blog
          </Typography>
        </IconButton>
        <Box sx={{ flexGrow: 1 }} />
      </Toolbar>
    </AppBar>
  );
}