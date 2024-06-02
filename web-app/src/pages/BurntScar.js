import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MUIDataTable from "mui-datatables";
import { Container, CircularProgress, TableCell, InputLabel, FormControl, Select, MenuItem, Grid, Card, CardContent } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchHotspotData } from "../reducers/dashboardSlice";
import { Provider, lightTheme } from '@adobe/react-spectrum';
import { DateRangePicker } from '@react-spectrum/datepicker';
import { fetchProvinceByCountry, fetchDataForBubble } from '../reducers/dashboardSlice';
import { Form } from '@react-spectrum/form';
import {parseDate} from '@internationalized/date';
import { format } from 'date-fns';

import BubbleChart from './../components/BubbleChart';


function BurntScar() {
  const dispatch = useDispatch();
  const dataHotspotC = useSelector((state) => state.dashboard.dataHotspotCountry ?? []);
  const dataProvince = useSelector((state) => state.dashboard.dataProvince ?? []);
  const [country, setCountry] = useState("ALL");
  const [province, setProvince] = useState("ALL");
  const [tableData, setTableData] = useState([]);

  const [countryText, setCountryText] = useState("All");
  const [provinceText, setProvinceText] = useState("All");

  let [dateValue, setDateValue] = useState({
    start: parseDate(format(new Date().setFullYear(new Date().getFullYear() - 1),'yyyy-MM-dd')),
    end: parseDate(format(new Date(),'yyyy-MM-dd'))
  });



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


  // แยก fetchHotspotDataCountry
  useEffect(() => {
    let obj = {
      country: country,
      province: province,
      startDate: format(new Date(dateValue.start),'yyyy-MM-dd'),
      endDate: format(new Date(dateValue.end),'yyyy-MM-dd')
    }
    if (country) {
      dispatch(fetchProvinceByCountry(country));
    }
    dispatch(fetchDataForBubble(obj));
  }, [dispatch, country, province, dateValue]);

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

      setTableData(newTableData);
    }
  }, [dataHotspotC]);


  const date = new Date();
  const dateTitle = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });



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

  const handleChangeCountry = (event) => {
    switch (event.target.value) {
      case 'THA':
        setCountryText("Thailand");
        break;
      case 'VNM':
        setCountryText("Vietnam");
        break;
      case 'LAO':
        setCountryText("Laos");
        break;
      case 'MMR':
        setCountryText("Myanmar");
        break;
      default:
        break;
    }
    setCountry(event.target.value);
  };

  const handleChangeProvince = (event) => {
    setProvince(event.target.value);
    setProvinceText(event.target.value);
  };


  return (
    <>
      <Container maxWidth="xl">
        <Box height={50} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, overflow: "hidden" }} variant="outlined">
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={2}>
                    <Box my={1} sx={{ minWidth: 120, display: "flex", justifyContent: "flex-start" }} >
                      <FormControl sx={{ m: 1, width: 300, borderRadius: 2 }} size="small">
                        <InputLabel id="country-select-label">Country</InputLabel>
                        <Select labelId="country-select-label" label="Country" value={country} onChange={(event) => handleChangeCountry(event)}>
                          <MenuItem value={"ALL"}><em>All</em></MenuItem>
                          <MenuItem value={"THA"}>Thailand</MenuItem>
                          <MenuItem value={"VNM"}>Vietnam</MenuItem>
                          <MenuItem value={"MMR"}>Myanmar</MenuItem>
                          <MenuItem value={"LAO"}>Laos</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box my={1} sx={{ minWidth: 120, display: "flex", justifyContent: "flex-start" }} >
                      <FormControl sx={{ m: 1, width: 300, borderRadius: 2 }} size="small">
                        <InputLabel id="province-select-label">Province</InputLabel>
                        <Select labelId="province-select-label" label="Province" value={province} onChange={(event) => handleChangeProvince(event)}>
                          <MenuItem key={"ALL"} value={"ALL"}><em>All</em></MenuItem>
                          {dataProvince.map((pv_en) => (
                            <MenuItem key={pv_en.PV_EN} value={pv_en.PV_EN}>
                              {pv_en.PV_EN}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={5.5}>
                    <Box my={1} sx={{ minWidth: 120, display: "flex", justifyContent: "flex-end" }} >
                      <Provider theme={lightTheme} colorScheme="light" scale="large">
                        <Form >
                            <DateRangePicker 
                              value={dateValue}
                              onChange={setDateValue}
                            />
                        </Form>
                      </Provider>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, overflow: "hidden" }} variant="outlined">
              <CardContent>
                <Typography  variant="h4" component="div">
                  Burnt scar in {countryText}
                </Typography>
                <Typography  variant="subtitle1" color="text.secondary">
                  {countryText} burnt scar (  {format(new Date(dateValue.start),'MMM dd yyyy')} - {format(new Date(dateValue.end),'MMM dd yyyy')} )
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, overflow: "hidden" }} variant="outlined">
              <CardContent>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, overflow: "hidden" }} variant="outlined">
              <CardContent>
                <BubbleChart/>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ borderRadius: 3, overflow: "hidden", flex: 1 }}>
                <MUIDataTable
                  title={<h3>Calculate the total number of hotspot per country on {dateTitle}</h3>}
                  data={tableData}
                  columns={columns}
                  options={options}
                />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default BurntScar;
