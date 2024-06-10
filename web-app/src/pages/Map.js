import React, { useState, useEffect } from "react";
import MapContent from "../components/MapContent";
import { Box, Card, CardContent, CircularProgress, Typography  } from "@mui/material";
import ToggleButton from "../components/ToggleButton";
import Sidebar from "../layout/Sidebar";
import ColorBar from "../components/ColorBar";
import ColorBarPoint from "../components/ColorBarPoint";
import { useSelector } from 'react-redux';

function Map() {
  const [isOpen, setIsOpen] = useState(false);
  const { burntScar, burntScarPoint } = useSelector(state => state.ui);
  const loadingMap = useSelector(state => state.ui.loadingMap);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (

    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", flexGrow: 1 }}>
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
            <ColorBar /> 
          </CardContent>
        </Card> }
        {burntScarPoint && <Card
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
            <ColorBarPoint /> 
          </CardContent>
        </Card> }
        {loadingMap && (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            width="100%"
            height="100%"
            position="absolute"
            top={0}
            left={0}
            zIndex={1050}
            bgcolor="rgba(0, 0, 0, 0.5)"
          >
            <CircularProgress />
            <Typography variant="h6" color="white">
              Loading...
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Map;
