import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MUIDataTable from "mui-datatables";
import { Container, CircularProgress, TableCell, InputLabel, FormControl, Select, MenuItem, Grid, Card, CardContent, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchProvinceByCountry, fetchAqiDataTable, fetchAqiChart } from '../reducers/dashboardSlice';
import { format } from 'date-fns';
import LineChartAqi from '../components/LineChartAqi';
import CONFIG from '../config';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import DrilldownAqiChart from '../components/DrilldownAqiChart';



function AirQualityDashboard() {
  const dispatch = useDispatch();
  const dataProvince = useSelector((state) => state.dashboard.dataProvince ?? []);
  const dataAqiTable = useSelector((state) => state.dashboard.dataAqiTable ?? []);
  const [country, setCountry] = useState("ALL");
  const [province, setProvince] = useState("ALL");
  const [totalPoint, setTotalPoint] = useState(0);
  const [dataShow, setDataShow] = useState([]);
  const [tableData, setTableData] = useState([]);

  const [countryText, setCountryText] = useState("All");
  const [provinceText, setProvinceText] = useState("All");


  const [startDate, setStartDate] = useState(dayjs(new Date().setFullYear(new Date().getFullYear() - 1)).format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs(new Date()).format('YYYY-MM-DD'));
  const [loadingMap, setLoadingMap] = useState(true);


  const handleStartDateChange = (date) => {
    setStartDate(date.format('YYYY-MM-DD'));
  };

  const handleEndDateChange = (date) => {
    if (startDate && date < startDate) {
      // Validate end date not less than start date
      console.error('End date cannot be less than start date');
      return;
    }
    setEndDate(date.format('YYYY-MM-DD'));
  };


  useEffect(() => {
    let obj = {
      country: country,
      province: province,
      startDate: startDate,
      endDate: endDate
    }
  
    if (country) {
      dispatch(fetchProvinceByCountry({ country: country, module: 'aqi' }));
    }
  
    setLoadingMap(true);
  
    dispatch(fetchAqiChart(obj))
      .finally(() => {
        dispatch(fetchAqiDataTable(obj))
          .finally(() => {
            setLoadingMap(false);
          });
      });
  }, [dispatch, country, province, startDate, endDate]);
  
  

  // Update chart data when dataHotspotC changes
  useEffect(() => {
    if (dataAqiTable) {

      const dataWithNumericSumArea = dataAqiTable.map(item => ({
        ...item,
        AVG_PM25: Number(item.AVG_PM25)
      }));
      
      const newTableData = [...dataWithNumericSumArea.map((item) => [item.NAME_LIST, item.AVG_PM25])];
      let dataShow = []
      if(country == 'ALL' && province=='ALL'){
        dataShow = [...dataWithNumericSumArea.map((item) => [item.ISO3, item.AVG_PM25])];
      }else{
        dataShow = [...dataWithNumericSumArea.map((item) => [item.NAME_LIST, item.AVG_PM25])];
      }
      const dataShowNewFormat = dataShow.map((item, index) => [index+1, ...item]);
      const newTableDataNewFormat = newTableData.map((item, index) => [index+1, ...item]);
      const totalRowsSum = dataWithNumericSumArea.reduce((sum, item) => sum + item.AVG_PM25, 0);
      const avg = totalRowsSum/dataWithNumericSumArea.length
      const formattedAvg = new Intl.NumberFormat('en-US').format(avg);
      setTableData(newTableDataNewFormat);
      setTotalPoint(formattedAvg);
      setDataShow(dataShowNewFormat)
    }
  }, [dataAqiTable]);


  //table
  const columns = [

    {
      name: "No.",
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
      name: "Name",
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
      name: "Avg of PM2.5 (µg/m^3)",
      options: {
        customHeadRender: ({ index, ...column }) => {
          return (
            <TableCell key={index} style={{ fontWeight: 600 }}>
              {column.name}
            </TableCell>
          );
        },
        customBodyRender: (value) => {
          // Format the numerical value with commas
          const formattedValue = new Intl.NumberFormat('th-TH', {
            useGrouping: true, // Enable commas for thousands
            maximumFractionDigits: 2,
          }).format(value);
  
          return formattedValue;
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
      case 'ALL':
        setProvince("ALL");
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

  const handleDownloadClick = () => {
    // Construct the GET request URL with query parameters

    let obj = {
      country: country,
      province: province,
      startDate: startDate,
      endDate: endDate
    }
    const csvUrl = `${CONFIG.API_URL}/get-csv-pm25?startDate=${obj.startDate}&endDate=${obj.endDate}`
    downloadCSV(csvUrl)
  };

  const downloadCSV = (csvUrl) => {
    fetch(csvUrl)
      .then(response => response.blob())
      .then(blob => {
        // สร้าง URL สำหรับ blob
        const url = window.URL.createObjectURL(blob);
        // สร้าง anchor tag และเซ็ต attribute สำหรับการดาวน์โหลด
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'data.csv'; // ตั้งชื่อไฟล์ที่จะดาวน์โหลด
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      })
      .catch(error => console.error('Error:', error));
  }


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
                  <Grid item xs={12} md={2}>
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
                  <Grid item xs={12} md={1}/>
                  <Grid item xs={12} md={2.5}>
                    <Box my={1} sx={{  display: "flex", justifyContent: "flex-start" }} >
                      <FormControl sx={{ m: 1, borderRadius: 2 }} size="small">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DemoContainer components={['DatePicker']}>
                            <DatePicker
                              label="Start Date"
                              value={dayjs(startDate)}
                              onChange={handleStartDateChange}
                              slotProps={{ textField: { size: 'small' }, InputProps: { readOnly: true } }}
                            />
                          </DemoContainer>
                        </LocalizationProvider>
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={2.5}>
                    <Box my={1} sx={{  display: "flex", justifyContent: "flex-start" }} >
                      <FormControl sx={{ m: 1, borderRadius: 2 }} size="small">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DemoContainer components={['DatePicker']}>
                            <DatePicker
                              label="End Date"
                              value={dayjs(endDate)}
                              onChange={handleEndDateChange}
                              slotProps={{ textField: { size: 'small' }, InputProps: { readOnly: true } }}
                              minDate={dayjs(startDate)} // Set minimum date for end date
                            />
                          </DemoContainer>
                        </LocalizationProvider>
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <Box my={1} sx={{ minWidth: 120, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button variant="contained" onClick={handleDownloadClick}>
                        Export CSV
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: 3, overflow: "hidden", height:'540px' }} variant="outlined">
              <CardContent>
                <Typography  variant="h4" component="div">
                  {provinceText != 'All' ? provinceText : countryText} air quality
                </Typography>
                <Typography  variant="subtitle1" color="text.secondary">
                  {provinceText != 'All' ? provinceText +', '+ countryText : countryText} air quality (  {format(new Date(startDate),'MMM dd yyyy')} - {format(new Date(endDate),'MMM dd yyyy')} )
                </Typography>
                <Box height={50}/>
                <Typography  variant="h3" component="div">
                  Average {totalPoint} µg/m^3
                </Typography>
                <Box height={50}/>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {dataShow.slice(0, 4).map((data, index) => (
                  <Box key={index} sx={{ width: 'calc(25% - 8px)' }}> {/* ลบด้วย 8px เพื่อคำนวณ spacing */}
                    <Card sx={{ borderRadius: 3, overflow: "hidden", border:0, backgroundColor: '#F5F5F5' }} variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" >
                          {data[1]}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {new Intl.NumberFormat('en-US').format(data[2])}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: 3, overflow: "hidden" }} variant="outlined">
              <CardContent>
                <DrilldownAqiChart/>              
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, overflow: "hidden" }} variant="outlined">
              <CardContent>
                <Typography variant="h4" component="div" gutterBottom>
                  Aqi By Time
                </Typography>
                <LineChartAqi/>      
              </CardContent>
            </Card>
          </Grid>
         
          <Grid item xs={12} md={12}>
            <Box sx={{ borderRadius: 3, overflow: "hidden", flex: 1}}>
                <MUIDataTable
                  title={<h4>Air Quality Ranking {format(new Date(startDate),'MMM dd yyyy')} - {format(new Date(endDate),'MMM dd yyyy')}</h4>}
                  data={tableData}
                  columns={columns}
                  options={options}
                />
            </Box>
          </Grid>
        </Grid>
      </Container>
      {loadingMap && (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          width="100%"
          height="100%"
          position="fixed"
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
    </>
  );
}

export default AirQualityDashboard;
