import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import { Button, Grid, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Logo from './m_burn_logo.png';
import { UserContext } from '../contexts/UserContext';

const pages = [
  { name: "Map" },
  {
    name: "Dashboard",
    subMenu: ["Burnt Level", "Hot Spot", "Air Quality"],
  },
  { name: "Learning Materials" },
  { name: "APIs" },
  { name: "About Us" },
];

export default function Header() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorElSignOut, setAnchorElSignOut] = React.useState(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const { userInfo, updateUserInfo } = React.useContext(UserContext);

  const handleNavigation = (page) => {
    const url = getPageUrl(page);
    navigate(url);
  };

  const getPageUrl = (page) => {
    switch (page) {
      case "Map":
        return "/";
      case "Hot Spot":
        return "/hot_spot";
      case "Air Quality":
        return "/pm_25";
      case "Burnt Level":
        return "/burn_scar";
      case "Learning Materials":
        return "/learning_materials";
      case "APIs":
        return "/api";
      case "About Us":
        return "/about_us";
      default:
        return "/";
    }
  };

  const handleOpen = (setter) => (event) => {
    setter(event.currentTarget);
  };

  const handleClose = (setter) => () => {
    setter(null);
  };

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const drawerList = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {pages.map((page, index) => (
          <React.Fragment key={index}>
            <ListItem button onClick={() => handleNavigation(page.name)}>
              <ListItemText primary={page.name} />
            </ListItem>
            {page.subMenu && page.subMenu.map((subPage) => (
              <ListItem key={subPage} button sx={{ pl: 4 }} onClick={() => handleNavigation(subPage)}>
                <ListItemText primary={subPage} />
              </ListItem>
            ))}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  const handleLogout = () => {
    updateUserInfo(null);
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#0077b6", color: "#fff", height: 56, justifyContent: 'center' }}>
      <Toolbar sx={{ minHeight: 56 }}>
        <Grid container alignItems="center">
          <Grid item xs={isMobile ? 9 : 2}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img src={Logo} alt="Logo" style={{ marginRight: '10px', width: '30px' }} />
              <Typography
                variant="h6"
                noWrap
                component="a"
                href="/rida-project/"
                sx={{
                  display: "flex",
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 700,
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                M-BurnScar
              </Typography>
            </Box>
          </Grid>
          {!isMobile && (
            <Grid item xs={8}>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                {pages.map((page, index) => (
                  <Box key={index} sx={{ mx: 2 }}>
                    <Button
                      underline="none"
                      onClick={(event) => {
                        event.preventDefault();
                        if (!page.subMenu) {
                          handleNavigation(page.name);
                        } else {
                          handleOpen(setAnchorEl)(event);
                        }
                      }}
                      sx={{ my: 2, display: "block", color: "#fff", textTransform: 'none', fontFamily: "'Roboto', sans-serif", fontWeight: 700 }}
                    >
                      {page.name}
                    </Button>
                    {page.subMenu && (
                      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose(setAnchorEl)}>
                        {page.subMenu.map((subPage) => (
                          <MenuItem
                            key={subPage}
                            onClick={(event) => {
                              event.preventDefault();
                              handleClose(setAnchorEl)();
                              handleNavigation(subPage);
                            }}
                          >
                            {subPage}
                          </MenuItem>
                        ))}
                      </Menu>
                    )}
                  </Box>
                ))}
              </Box>
            </Grid>
          )}
          <Grid item xs={isMobile ? 3 : 2}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              {isMobile && (
                <IconButton
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  sx={{ mr: 2 }}
                  onClick={toggleDrawer(true)}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
                {drawerList()}
              </Drawer>
              {!userInfo ? (
                <Button
                  onClick={handleLogin}
                  sx={{ my: 2, color: '#fff', display: 'block' }}
                >
                  Login
                </Button>
              ) : (
                <>
                  <Typography variant="body1" sx={{ color: "#fff", mr: 2 }}>
                    {userInfo.name} {userInfo.surname}
                  </Typography>
                  <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleOpen(setAnchorElSignOut)}
                    color="inherit"
                  >
                    <AccountCircle />
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorElSignOut}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    open={Boolean(anchorElSignOut)}
                    onClose={handleClose(setAnchorElSignOut)}
                  >
                    <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}
