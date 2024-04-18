import React, { useState, useEffect } from "react";
import { Chart } from "react-google-charts";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Container, CircularProgress, Grid } from "@mui/material";

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const date = new Date();
  const formattedDate = date.toISOString().slice(0, 10);

  const dateTitle = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const urls = [
      `https://firms.modaps.eosdis.nasa.gov/api/country/csv/579db9c41c852c1f75bc6b73f8b90262/MODIS_NRT/THA/1/${formattedDate}`,
      `https://firms.modaps.eosdis.nasa.gov/api/country/csv/579db9c41c852c1f75bc6b73f8b90262/MODIS_NRT/MMR/1/${formattedDate}`,
      `https://firms.modaps.eosdis.nasa.gov/api/country/csv/579db9c41c852c1f75bc6b73f8b90262/MODIS_NRT/LAO/1/${formattedDate}`,
      `https://firms.modaps.eosdis.nasa.gov/api/country/csv/579db9c41c852c1f75bc6b73f8b90262/MODIS_NRT/VNM/1/${formattedDate}`,
    ];

    const fetchData = async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      return text.length;
    };

    const fetchAllData = () => {
      Promise.all(urls.map((url) => fetchData(url)))
        .then((lengths) => {
          setData([
            ["Country", "Count"],
            ["Thai", lengths[0]],
            ["Myanmar", lengths[1]],
            ["Lao", lengths[2]],
            ["Vietnam", lengths[3]],
          ]);
          setLoading(false);
        })
        .catch((e) => {
          console.log(e);
          setLoading(false);
        });
    };

    // Fetch data immediately and then every 5 seconds
    fetchAllData();
    const intervalId = setInterval(fetchAllData, 30000);

    // Clear interval on unmount
    return () => clearInterval(intervalId);
  }, [formattedDate]);

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
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ borderRadius: 5, overflow: "hidden" }}>
                  <Chart chartType="PieChart" width="100%" height="400px" data={data} options={pieOptions} />
                </Box>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Box mx="2" my="2">
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ borderRadius: 5, overflow: "hidden" }}>
                  <Chart chartType="BarChart" width="100%" height="400px" data={data} options={barOptions} />
                </Box>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Box mx="2" my="2">
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ borderRadius: 5, overflow: "hidden" }}>
                  <Chart chartType="ColumnChart" width="100%" height="400px" data={data} options={columnOptions} />
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
