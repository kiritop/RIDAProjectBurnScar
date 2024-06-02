import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MUIDataTable from "mui-datatables";
import { Container, CircularProgress, TableCell, InputLabel, FormControl, Select, MenuItem, Grid, Card, CardContent } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchHotspotData } from "../reducers/dashboardSlice";
import { Provider, lightTheme } from '@adobe/react-spectrum';
import { DatePicker, DateRangePicker } from '@react-spectrum/datepicker';
import { fetchProvinceByCountry } from '../reducers/dashboardSlice';
import { Form } from '@react-spectrum/form';


function BurntScar() {
  const dispatch = useDispatch();
  const dataHotspotC = useSelector((state) => state.dashboard.dataHotspotCountry ?? []);
  const [country, setCountry] = useState("ALL");
  const [province, setProvince] = useState("ALL");
  const [chartData, setChartData] = useState([["Country", "Count"]]);
  const [tableData, setTableData] = useState([]);

  const [startDate, setStartDate] = useState(new Date());
const [endDate, setEndDate] = useState(new Date());

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


  // แยก fetchHotspotDataCountry
  useEffect(() => {
    console.log('country', country)
    if (country) {
      dispatch(fetchProvinceByCountry(country));
    }

    // Clear interval on unmount
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


  const date = new Date();
  const dateTitle = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });


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
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            
            <Box my={1} sx={{ minWidth: 120, display: "flex", justifyContent: "flex-end" }}>
              <FormControl sx={{ m: 1, width: 300, borderRadius: 2 }} size="small">
                <InputLabel id="country-select-label">Country</InputLabel>
                <Select labelId="country-select-label" label="Country" value={country} onChange={(event) => setCountry(event.target.value)}>
                  <MenuItem value={"ALL"}><em>All</em></MenuItem>
                  <MenuItem value={"THA"}>Thailand</MenuItem>
                  <MenuItem value={"VNM"}>Vietnam</MenuItem>
                  <MenuItem value={"MMR"}>Myanmar</MenuItem>
                  <MenuItem value={"LAO"}>Laos</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
          {country !== 'ALL' && (<Grid item xs={12} md={4}>
            
            <Box my={1} sx={{ minWidth: 120, display: "flex", justifyContent: "flex-end" }}>
            {country !== 'ALL' && (<FormControl sx={{ m: 1, width: 300, borderRadius: 2 }} size="small">
                <InputLabel id="province-select-label">Province</InputLabel>
                <Select labelId="province-select-label" label="Province" value={province} onChange={(event) => setProvince(event.target.value)}>
                  <MenuItem value={"ALL"}><em>All</em></MenuItem>
                  <MenuItem value={"BKK"}>Bangkok</MenuItem>
                  <MenuItem value={"CM"}>Chiang Mai</MenuItem>
                  <MenuItem value={"PB"}>Phuket</MenuItem>
                  <MenuItem value={"SR"}>Surat Thani</MenuItem>
                </Select>
              </FormControl>)}
            </Box>
          </Grid>)}
          <Provider theme={lightTheme} colorScheme="light" scale="large">
            <Form >
              <Grid item xs={12} md={4} >
                <DateRangePicker label="Select Date Range" startDate={startDate} endDate={endDate} onChange={({startDate, endDate}) => {setStartDate(startDate); setEndDate(endDate);}} />
              </Grid>
            </Form>
          </Provider>
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
