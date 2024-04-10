/* eslint-disable no-unused-vars */
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
import MapIcon from "@mui/icons-material/Map";
import { Button } from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import CONFIG from "../config";

const pages = [
  { name: "Map" },
  {
    name: "Dash Board",
    subMenu: ["Hotspot", "Burnt scar", "PM2.5"],
  },
  { name: "Learning Material" },
  { name: "APIs" },
  { name: "About US" },
];
// const settings = ["Profile", "Account", "Dashboard", "Logout"];

export default function Header() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorElGoogle, setAnchorElGoogle] = React.useState(null);
  const [userInfo, setUserInfo] = React.useState(JSON.parse(localStorage.getItem("myData")) || "");

  React.useEffect(() => {
    localStorage.setItem("myData", JSON.stringify(userInfo));
  }, [userInfo]);

  function getPageUrl(page) {
    switch (page) {
      case "Map":
        return "/";
      case "Hotspot":
        return "/dash_board";
      case "Learning Material":
        return "/learning_material";
      case "APIs":
        return "/api";
      case "About US":
        return "/about_us";
      default:
        return "/";
    }
  }

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleGoogle = (event) => {
    setAnchorElGoogle(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGoogleClose = () => {
    setAnchorElGoogle(null);
  };


  const loginApi = async (name, email) => {
    const payload = {
      google_id: email,
      name: name,
      email: email,
    };

    try {
      const response = await axios.post(CONFIG.API_URL + "/login", payload);
      return response.data; // return the response data
    } catch (error) {
      console.error(error); // log the error message
    }
  };
  return (
    <AppBar position="static" sx={{ backgroundColor: "#0077b6", color: "#fff" }}>
      <Toolbar variant="dense">
        <MapIcon sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          noWrap
          component="a"
          href="/"
          sx={{
            mr: 2,
            display: "flex",
            fontFamily: "monospace",
            fontWeight: 700,
            // letterSpacing: ".3rem",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          RIDA - BURNT SCAR MAP PROJECT
        </Typography>
        <Box sx={{ flexGrow: 12, display: { xs: "none", md: "flex" } }} />
        {pages.map((page, index) => {
          return (
            <div key={index}>
              <Button
                underline="none"
                onClick={(event) => {
                  event.preventDefault();
                  if (!page.subMenu) {
                    window.location.href = getPageUrl(page.name);
                  } else {
                    handleMenu(event);
                  }
                }}
                sx={{ my: 2, display: "block", color: "#fff", mx: 1, fontFamily: "monospace", fontWeight: 700 }}
              >
                <center>{page.name}</center>
              </Button>
              {page.subMenu && (
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                  {page.subMenu.map((subPage) => (
                    <MenuItem
                      key={subPage}
                      onClick={(event) => {
                        event.preventDefault();
                        window.location.href = getPageUrl(subPage);
                        handleClose();
                      }}
                    >
                      {subPage}
                    </MenuItem>
                  ))}
                </Menu>
              )}
            </div>
          );
        })}

        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end" }}>
          {!userInfo ? (
            <>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleGoogle}
                color="inherit"
              >
                <GoogleIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElGoogle}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElGoogle)}
                onClose={handleGoogleClose}
              >
                <MenuItem onClick={handleGoogleClose}>
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      const decoded = jwtDecode(credentialResponse?.credential);
                      const name = decoded.given_name;
                      const email = decoded.email;
                      setUserInfo(email);
                      loginApi(name, email);
                      window.location.reload();
                    }}
                    onError={() => {}}
                  />
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <p>{userInfo}</p>

              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleGoogleClose}
              >
                <MenuItem
                  onClick={() => {
                    setUserInfo(null);
                    window.location.reload();
                  }}
                >
                  Sign Out
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
