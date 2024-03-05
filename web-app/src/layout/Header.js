import React from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import InfoIcon from '@mui/icons-material/Info';
import ArticleIcon from '@mui/icons-material/Article';

function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton color="inherit">
          <MapIcon />
          <Typography variant="h6" component="div">
            Map
          </Typography>
        </IconButton>
        <IconButton color="inherit">
          <ShoppingBagIcon />
          <Typography variant="h6" component="div">
            Service
          </Typography>
        </IconButton>
        <IconButton color="inherit">
          <InfoIcon />
          <Typography variant="h6" component="div">
            About us
          </Typography>
        </IconButton>
        <IconButton color="inherit">
          <ArticleIcon />
          <Typography variant="h6" component="div">
            Blog
          </Typography>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default Header;