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
import { Button } from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode"; // Import jwtDecode correctly as named import
import axios from "axios";
import CONFIG from "../config";
import Logo from './m_burn_logo.png';
import { useNavigate } from "react-router-dom";

const pages = [
  { name: "Map" },
  {
    name: "DashBoard",
    subMenu: ["Burnt Level", "Hot Spot", "Air Quality"],
  },
  { name: "Learning Material" },
  { name: "APIs" },
  { name: "About US" },
];

export default function Header() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorElSignIn, setAnchorElSignIn] = React.useState(null);
  const [anchorElSignOut, setAnchorElSignOut] = React.useState(null);
  const [userInfo, setUserInfo] = React.useState(
    JSON.parse(localStorage.getItem("myData")) || null
  );
  const navigate = useNavigate();

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
      case "Learning Material":
        return "/learning_material";
      case "APIs":
        return "/api";
      case "About US":
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

  return (
    <AppBar position="static" sx={{ backgroundColor: "#0077b6", color: "#fff" }}>
      <Toolbar variant="dense">
        <img src={Logo} alt="Logo" style={{ marginRight: '10px', width: '30px' }} />
        <Typography
          variant="h6"
          noWrap
          component="a"
          href="/rida-project/"
          sx={{
            mr: 2,
            display: "flex",
            fontFamily: "monospace",
            fontWeight: 700,
            color: "inherit",
            textDecoration: "none",
          }}
        >
          M-BurnScar 
        </Typography>
        <Box sx={{ flexGrow: 12, display: { xs: "none", md: "flex" } }} />
        {pages.map((page, index) => (
          <div key={index}>
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
              sx={{ my: 2, display: "block", color: "#fff", mx: 1, fontFamily: "monospace", fontWeight: 700 }}
            >
              <center>{page.name}</center>
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
          </div>
        ))}
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end" }}>
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
                      const decoded = jwtDecode(credentialResponse?.credential); // Correctly using jwtDecode here
                      const name = decoded.given_name;
                      const email = decoded.email;
                      setUserInfo(email); // Set user info to email (or to decoded if it has all info)
                      loginApi(name, email); // Call login API
                      handleClose(setAnchorElSignIn)();
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
                onClick={handleOpen(setAnchorElSignOut)}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Typography variant="body1" sx={{ color: "#fff", mr: 2 }}>
                {userInfo}
              </Typography>
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
      </Toolbar>
    </AppBar>
  );
}
