import React, { useState } from "react";
import MapContent from "../components/MapContent";
import { Box, Card, CardContent } from "@mui/material";
import ToggleButton from "../components/ToggleButton";
import Sidebar from "../layout/Sidebar";
import ColorBar from "../components/ColorBar";
import { useSelector } from 'react-redux';

function Map() {
  const [isOpen, setIsOpen] = useState(false);
  const { burntScar } = useSelector(state => state.ui);
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };
  return (
    // <div className="Home">
    //   {/* <Header /> */}
    //   {/* <Sidebar /> */}
    //   <MapContent z/>
    // </div>
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        {/* <Sidebar /> */}
        {/* <ToggleButton toggleDrawer={toggleDrawer}/> */}
        <ToggleButton isOpen={isOpen} toggleDrawer={toggleDrawer} />
        <MapContent z />
        <Sidebar isOpen={isOpen} toggleDrawer={toggleDrawer} />
        {burntScar && <Card
          sx={{
            position: "absolute",
            bottom: "10%",
            left: 16,
            maxWidth: "20%",
            zIndex: 1050,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
          }}
        >
          <CardContent>
            <ColorBar /> {/* แสดงแถบสีใน Card */}
          </CardContent>
        </Card> }
      </Box>
    </Box>
  );
}

export default Map;
