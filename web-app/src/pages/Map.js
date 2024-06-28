import React, { useState } from "react";
import MapContent from "../components/MapContent";
import { Box, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import ColorBar from "../components/ColorBar";
import ColorBarPoint from "../components/ColorBarPoint";
import { useSelector } from 'react-redux';
import FilterCard from "../components/FilterCard";

function Map() {
  const [isOpen, setIsOpen] = useState(false);
  const { burntScar, burntScarPoint } = useSelector(state => state.ui);
  const loadingMap = useSelector(state => state.ui.loadingMap);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)", overflow: "hidden" }}>
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        <Box sx={{ flex: 4, position: "relative", height: "100vh", overflow: "hidden" }}>
          <MapContent />
          <Card
            sx={{
              position: "absolute",
              top: "30%",
              left: 16,
              maxWidth: "20%",
              zIndex: 1050,
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              margin: 0
            }}
          >
          </Card>
          {burntScar && (
            <Card
              sx={{
                position: "absolute",
                bottom: "10%",
                left: 16,
                maxWidth: "20%",
                zIndex: 1050,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                margin: 0
              }}
            >
              <CardContent sx={{ padding: 1 }}>
                <ColorBar />
              </CardContent>
            </Card>
          )}
          {burntScarPoint && (
            <Card
              sx={{
                position: "absolute",
                bottom: "10%",
                left: 16,
                maxWidth: "20%",
                zIndex: 1050,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                margin: 0
              }}
            >
              <CardContent sx={{ padding: 1 }}>
                <ColorBarPoint />
              </CardContent>
            </Card>
          )}
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
        <Box sx={{ flex: 1, height: "100vh", overflow: "hidden", display: 'flex' }}>
          <FilterCard />
        </Box>
      </Box>
    </Box>
  );
}

export default Map;
