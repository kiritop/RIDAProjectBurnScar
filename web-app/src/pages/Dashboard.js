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

    Promise.all(urls.map((url) => fetchData(url)))
      .then((lengths) => {
        setData([
          ["Country", "Amount Hotspot"],
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
  }, [formattedDate]);

  const pieOptions = {
    title: "Hot Spot",
    pieHole: 0.4,
    is3D: false,
  };

  const barOptions = {
    title: "Hot Spot",
    hAxis: { title: "Country" },
    vAxis: { title: "Amount Hotspot" },
    bars: "horizontal",
  };

  const columnOptions = {
    title: "Hot Spot",
    hAxis: { title: "Country" },
    vAxis: { title: "Amount Hotspot" },
  };

  return (
    <>
      <Box h={5} />
      <Container>
        <Box height={50} />
        <Typography variant="h3" color="initial">
          Dash Board
        </Typography>
        <Box height={10} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Box mx="2" my="2">
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                  <CircularProgress />
                </Box>
              ) : (
                <Chart chartType="PieChart" width="100%" height="400px" data={data} options={pieOptions} />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box mx="2" my="2">
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                  <CircularProgress />
                </Box>
              ) : (
                <Chart chartType="BarChart" width="100%" height="400px" data={data} options={barOptions} />
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
                <Chart chartType="ColumnChart" width="100%" height="400px" data={data} options={columnOptions} />
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default Dashboard;
