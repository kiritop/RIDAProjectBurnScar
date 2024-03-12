/* eslint-disable no-unused-vars */
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import MapIcon from "@mui/icons-material/Map";
import Link from "@mui/material/Link";
import { Button } from "@mui/material";

const pages = ["Burnt Scar Map", "Learning Material", "API", "About US"];
const settings = ["Profile", "Account", "Dashboard", "Logout"];

export default function Header() {
  const [anchorEl, setAnchorEl] = React.useState(null);

  function getPageUrl(page) {
    switch (page) {
      case "Burnt Scar Map":
        return "/";
      case "Learning Material":
        return "/learning_material";
      case "API":
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

  return (
    <AppBar position="static" sx={{ backgroundColor: "#50C1DD", color: "#fff" }}>
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
              {/* <Link href="/login" variant="body1" underline="hover"> */}
                <img src="google.png" alt="Google Icon" style={{ marginRight: "8px", width: "24px", height: "24px" }} />
                Login with Google
              {/* </Link> */}
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
