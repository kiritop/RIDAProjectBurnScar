import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AccountCircle from "@mui/icons-material/AccountCircle";
import GoogleIcon from "@mui/icons-material/Google";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import { Button, Grid, useMediaQuery } from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode"; // Import jwtDecode correctly as named import
import axios from "axios";
import CONFIG from "../config";
import Logo from './m_burn_logo.png';
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

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
  const [anchorElSignIn, setAnchorElSignIn] = React.useState(null);
  const [anchorElSignOut, setAnchorElSignOut] = React.useState(null);
  const [userInfo, setUserInfo] = React.useState(
    JSON.parse(localStorage.getItem("myData")) || null
  );
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');

  React.useEffect(() => {
    localStorage.setItem("myData", JSON.stringify(userInfo));
  }, [userInfo]);

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

  const loginApi = async (name, email) => {
    const payload = {
      username: email,
      name: name,
      email: email,
    };

    try {
      const response = await axios.post(CONFIG.API_URL + "/login", payload);
      return response.data; // Return the response data
    } catch (error) {
      console.error(error); // Log the error message
    }
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
                <>
                  <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleOpen(setAnchorElSignIn)}
                    color="inherit"
                  >
                    <GoogleIcon />
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorElSignIn}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    open={Boolean(anchorElSignIn)}
                    onClose={handleClose(setAnchorElSignIn)}
                  >
                    <MenuItem onClick={handleClose(setAnchorElSignIn)}>
                      <GoogleLogin
                        onSuccess={(credentialResponse) => {
                          const decoded = jwtDecode(credentialResponse?.credential);
                          const name = decoded.given_name;
                          const email = decoded.email;
                          setUserInfo(email);
                          loginApi(name, email);
                          handleClose(setAnchorElSignIn)();
                        }}
                        onError={() => {}}
                      />
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Typography variant="body1" sx={{ color: "#fff", mr: 2 }}>
                    {userInfo}
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
                    <MenuItem
                      onClick={() => {
                        setUserInfo(null);
                        handleClose(setAnchorElSignOut)();
                      }}
                    >
                      Sign Out
                    </MenuItem>
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
