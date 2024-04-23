import React, { useEffect } from "react";
import { Chart } from "react-google-charts";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Container, CircularProgress, Grid } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchHotspotData } from "../reducers/dashboardSlice";

function Dashboard() {
  const dispatch = useDispatch();
  const dataHotspot = useSelector((state) => state.dashboard.dataHotspot);

  useEffect(() => {
    dispatch(fetchHotspotData());
    // // Then fetch data every 30 seconds
    const intervalId = setInterval(() => {
      dispatch(fetchHotspotData());
    }, 300000);

    // // Clear interval on unmount
    return () => clearInterval(intervalId);
  }, [dispatch]);

  let dataFormat = [
    ["Country", "Count"],
    ["Thai", dataHotspot?.[0]],
    ["Myanmar", dataHotspot?.[1]],
    ["Lao", dataHotspot?.[2]],
    ["Vietnam", dataHotspot?.[3]],
  ];

  const date = new Date();
  const dateTitle = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const pieOptions = {
    title: "Hotspot Count on" + dateTitle,
    pieHole: 0.4,
    is3D: false,
  };

  const barOptions = {
    title: "Hotspot Count on" + dateTitle,
    hAxis: { title: "Count" },
    vAxis: { title: "Country" },
    bars: "horizontal",
  };

  const columnOptions = {
    title: "Hotspot Count on" + dateTitle,
    hAxis: { title: "Country" },
    vAxis: { title: "Count" },
  };

  return (
    <>
      <Box h={5} />
      <Container>
        <Box height={50} />
        <Typography variant="h4" color="initial">
          Hotspot Analysis
        </Typography>
        <Box height={10} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box mx="2" my="2">
              {!dataHotspot ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ borderRadius: 5, overflow: "hidden" }}>
                  <Chart chartType="PieChart" width="100%" height="400px" data={dataFormat} options={pieOptions} />
                </Box>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Box mx="2" my="2">
              {!dataHotspot ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ borderRadius: 5, overflow: "hidden" }}>
                  <Chart chartType="BarChart" width="100%" height="400px" data={dataFormat} options={barOptions} />
                </Box>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Box mx="2" my="2">
              {!dataHotspot ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ borderRadius: 5, overflow: "hidden" }}>
                  <Chart
                    chartType="ColumnChart"
                    width="100%"
                    height="400px"
                    data={dataFormat}
                    options={columnOptions}
                  />
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default Dashboard;
