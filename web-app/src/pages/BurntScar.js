import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MUIDataTable from "mui-datatables";
import { Container, CircularProgress, TableCell, InputLabel, FormControl, Select, MenuItem, Grid, Card, CardContent } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchHotspotData, fetchHotspotDataCountry } from "../reducers/dashboardSlice";
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file


function BurntScar() {
  const dispatch = useDispatch();
  const dataHotspot = useSelector((state) => state.dashboard.dataHotspot);
  const dataHotspotC = useSelector((state) => state.dashboard.dataHotspotCountry ?? []);
  const [country, setCountry] = useState("THA");
  const [chartData, setChartData] = useState([["Country", "Count"]]);
  const [tableData, setTableData] = useState([]);
  const [yearRange, setYearRange] = useState([2010, 2020]); // Add this line
  console.log(dataHotspotC);

  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: null,
      key: 'selection'
    }
  ]);

  // แยก fetchHotspotData
  useEffect(() => {
    dispatch(fetchHotspotData());
    // Fetch data every 30 seconds
    const intervalId = setInterval(() => {
      dispatch(fetchHotspotData());
    }, 300000);

    // Clear interval on unmount
    return () => clearInterval(intervalId);
  }, [dispatch]);

  // useEffect(() => {
  //   dispatch(setLoadingMap(true));
  //   dispatch(fetchBurntScarPolygon(sidebarForm))
  //   .finally(() => {
  //     dispatch(setLoadingMap(false));
  //   });
    
  // }, [dispatch, sidebarForm]);

  // แยก fetchHotspotDataCountry
  useEffect(() => {
    dispatch(fetchHotspotDataCountry(country));
    // Fetch data every 30 seconds
    const intervalId = setInterval(() => {
      dispatch(fetchHotspotData());
    }, 300000);

    // Clear interval on unmount
    return () => clearInterval(intervalId);
  }, [dispatch, country]);

  // Update chart data when dataHotspotC changes
  useEffect(() => {
    if (dataHotspotC) {
      const uniqueDataHotspotC = dataHotspotC.reduce((acc, curr) => {
        if (!acc.some((item) => item.country === curr.country)) {
          acc.push(curr);
        }
        return acc;
      }, []);
      // Sort the data by count in descending order
      const sortedData = [...uniqueDataHotspotC].sort((a, b) => b.count - a.count);

      // Update your state variables (chartData and tableData)
      const newChartData = [["Country", "Count"], ...sortedData.map((e) => [e.country, e.count])];
      const newTableData = [...sortedData.map((item) => [item.country, item.count])];

      setChartData(newChartData);
      setTableData(newTableData);
    }
  }, [dataHotspotC]);

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

  const LineOptions = {
    title: "Calculate the total number of hotspot per country on " + dateTitle,
    hAxis: {
      title: "Country",
    },
    vAxis: {
      title: "Count",
    },
  };

  //table
  const columns = [
    {
      name: "Country",
      options: {
        customHeadRender: ({ index, ...column }) => {
          return (
            <TableCell key={index} style={{ backgroundColor: "#264653", color: "#fff", fontWeight: 600 }}>
              {column.name}
            </TableCell>
          );
        },
      },
    },
    {
      name: "Count",
      options: {
        customHeadRender: ({ index, ...column }) => {
          return (
            <TableCell key={index} style={{ backgroundColor: "#fb8500", fontWeight: 600 }}>
              {column.name}
            </TableCell>
          );
        },
      },
    },
  ];

  const options = {
    filterType: "checkbox",
    filter: false,
    download: false,
    print: false,
    viewColumns: false,
    search: false,
    selectableRows: "none",
    setTableProps: () => {
      return {
        style: {
          textAlign: "center",
        },
      };
    },
  };

  return (
    <>
      <Box h={5} />
      <Container>
        <Box height={50} />
        <Typography mb={3} variant="h4" color="initial">
          Burnt Scar Dashboard
        </Typography>
        <Box height={10} />
        <Box height={10} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box my={1} sx={{display: "flex", justifyContent: "flex-end" }}>
                      <DateRange
                        editableDateInputs={true}
                        onChange={item => setState([item.selection])}
                        moveRangeOnFirstSelection={false}
                        ranges={state}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ minWidth: 120, display: "flex", justifyContent: "flex-end" }}>
                      <Box mr={24}>
                        <InputLabel id="country-select-label">Select Country :</InputLabel>
                      </Box>
                    </Box>
                    <Box my={1} sx={{ minWidth: 120, display: "flex", justifyContent: "flex-end" }}>
                      <FormControl sx={{ m: 1, width: 300, backgroundColor: "#fff", borderRadius: 2 }}>
                        <Select labelId="country-select-label" value={country} onChange={(event) => setCountry(event.target.value)}>
                          <MenuItem value={"THA"}>Thailand</MenuItem>
                          <MenuItem value={"VNM"}>Vietnam</MenuItem>
                          <MenuItem value={"MMR"}>Myanmar</MenuItem>
                          <MenuItem value={"LAO"}>Laos</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                {!dataHotspotC ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress />
                  </Box>
                ) : (
                  <Chart width={"100%"} height={600} chartType="LineChart" data={chartData} options={LineOptions} />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <MUIDataTable
                  title={<h3>Calculate the total number of hotspot per country on {dateTitle}</h3>}
                  data={tableData}
                  columns={columns}
                  options={options}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default BurntScar;
