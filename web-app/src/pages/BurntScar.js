import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MUIDataTable from "mui-datatables";
import { Container, CircularProgress, TableCell, InputLabel, FormControl, Select, MenuItem, Grid, Card, CardContent } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Provider, lightTheme } from '@adobe/react-spectrum';
import { DateRangePicker } from '@react-spectrum/datepicker';
import { fetchProvinceByCountry, fetchDataForBubble, fetchDataPoint } from '../reducers/dashboardSlice';
import { Form } from '@react-spectrum/form';
import {parseDate} from '@internationalized/date';
import { format } from 'date-fns';

import BubbleChart from './../components/BubbleChart';
import LineChart from './../components/LineChart';



function BurntScar() {
  const dispatch = useDispatch();
  const dataProvince = useSelector((state) => state.dashboard.dataProvince ?? []);
  const dataPoint = useSelector((state) => state.dashboard.dataPoint ?? []);
  const [country, setCountry] = useState("ALL");
  const [province, setProvince] = useState("ALL");
  const [totalPoint, setTotalPoint] = useState(0);
  const [peek, setPeek] = useState(0);
  const [tableData, setTableData] = useState([]);

  const [countryText, setCountryText] = useState("All");
  const [provinceText, setProvinceText] = useState("All");

  let [dateValue, setDateValue] = useState({
    start: parseDate(format(new Date().setFullYear(new Date().getFullYear() - 1),'yyyy-MM-dd')),
    end: parseDate(format(new Date(),'yyyy-MM-dd'))
  });


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
    dispatch(fetchDataPoint(obj));
    
  }, [dispatch, country, province, dateValue]);

  // Update chart data when dataHotspotC changes
  useEffect(() => {
    if (dataPoint) {
      
      const newTableData = [...dataPoint.map((item) => [item['YEAR(FIRE_DATE)'], item.total_rows])];
      const totalRowsSum = dataPoint.reduce((sum, item) => sum + item.total_rows, 0);
      const maxTotalRows = Math.max(...dataPoint.map((item) => item.total_rows));
      setTableData(newTableData);
      setTotalPoint(totalRowsSum);
      setPeek(maxTotalRows)
    }
  }, [dataPoint]);




  //table
  const columns = [
    {
      name: "Year",
      options: {
        customHeadRender: ({ index, ...column }) => {
          return (
            <TableCell key={index} style={{  fontWeight: 600 }}>
              {column.name}
            </TableCell>
          );
        },
      },
    },
    {
      name: "Total point",
      options: {
        customHeadRender: ({ index, ...column }) => {
          return (
            <TableCell key={index} style={{ fontWeight: 600 }}>
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
                  Burnt scar in {provinceText != 'ALL' ? provinceText : countryText}
                </Typography>
                <Typography  variant="subtitle1" color="text.secondary">
                  {provinceText != 'ALL' ? provinceText +', '+ countryText : countryText}  burnt scar (  {format(new Date(dateValue.start),'MMM dd yyyy')} - {format(new Date(dateValue.end),'MMM dd yyyy')} )
                </Typography>
                <Box height={20}/>
                <Typography  variant="h3" component="div">
                  {totalPoint} Point
                </Typography>
                <Box height={20}/>
                <Card sx={{ borderRadius: 3, overflow: "hidden", border:0, backgroundColor: '#F5F5F5' }} variant="outlined">
                  <CardContent>
                    <Typography  variant="subtitle1" color="text.secondary">
                      Peek
                    </Typography>
                    <Typography  variant="h4" color="text.secondary">
                      {peek}
                    </Typography>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, overflow: "hidden" }} variant="outlined">
              <CardContent>
                <LineChart/>              
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
            <Box sx={{ borderRadius: 3, overflow: "hidden", flex: 1}}>
                <MUIDataTable
                  title={<h3>Total point of burnt scar on {format(new Date(dateValue.start),'MMM dd yyyy')} - {format(new Date(dateValue.end),'MMM dd yyyy')}</h3>}
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
