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
import Link from "@mui/material/Link";
import { Button } from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";

import axios from "axios";

const pages = ["Map", "Learning Material", "APIs", "About US"];
const settings = ["Profile", "Account", "Dashboard", "Logout"];

export default function Header() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [userInfo, setUserInfo] = React.useState(JSON.parse(localStorage.getItem("myData")) || "");

  React.useEffect(() => {
    localStorage.setItem("myData", JSON.stringify(userInfo));
  }, [userInfo]);

  function getPageUrl(page) {
    switch (page) {
      case "Map":
        return "/";
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

  const handleClose = () => {
    setAnchorEl(null);
  };

  const loginApi = async (name, email) => {
    const payload = {
      google_id: email,
      name: name,
      email: email,
    };

    try {
      const response = await axios.post("http://localhost:3000/login", payload);
    } catch (error) {}
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
        {pages.map((page) => (
          <Button
            key={page}
            underline="none"
            href={getPageUrl(page)}
            sx={{ my: 2, display: "block", color: "#fff", mx: 1, fontFamily: "monospace", fontWeight: 700 }}
          >
            <center> {page}</center>
          </Button>
        ))}

        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end" }}>
          {!userInfo ? (
            <>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <GoogleIcon />
              </IconButton>
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
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>
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
                onClose={handleClose}
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
