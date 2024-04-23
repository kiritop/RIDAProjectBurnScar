/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MUIDataTable from "mui-datatables";
import { Container, CircularProgress, FormControl, TableCell, InputLabel } from "@mui/material";
import { Chart } from "react-google-charts";
import { Select, MenuItem } from "@mui/material";
import dataAll from "../reducers/json/data_state.json";
import { useDispatch, useSelector } from "react-redux";
import { fetchPM25Data } from "../reducers/dashboardSlice";

function PM25() {
  const [country, setCountry] = useState("TH");
  const dispatch = useDispatch();
  const dataPM25 = useSelector((state) => state.dashboard.dataPM25);
  const filteredData = dataAll.filter((data) => data.iso2 === country);

  useEffect(() => {
    dispatch(fetchPM25Data(filteredData));
  }, [country]);

  const date = new Date();

  const dateTitle = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }); 

  const chartData = [["City", "PM2.5 Value"], ...dataPM25.map((item) => [item.city, item.pm25])];  
  const tableData = [...dataPM25.map((item) => [item.city, item.pm25])];

  const LineOptions = {
    title: "Air Quality Index (PM 2.5) for Given Date" + dateTitle,
    hAxis: {
      title: "City",
    },
    vAxis: {
      title: "PM2.5 Value",
    },
  };

  const columns = [
    {
      name: "City",
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
      name: "PM2.5 Value",
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
        <Typography variant="h4" color="initial">
          PM2.5 Data Interpretation
        </Typography>
        <Box height={10} />
        <Box sx={{ minWidth: 120, display: "flex", justifyContent: "flex-end" }}>
          <Box mr={24}>
            <InputLabel id="country-select-label">Select Country :</InputLabel>
          </Box>
        </Box>
        <Box my={1} sx={{ minWidth: 120, display: "flex", justifyContent: "flex-end" }}>
          <FormControl sx={{ m: 1, width: 300, backgroundColor: "#fff", borderRadius: 2 }}>
            <Select labelId="country-select-label" value={country} onChange={(event) => setCountry(event.target.value)}>
              <MenuItem value={"TH"}>Thailand</MenuItem>
              <MenuItem value={"VN"}>Vietnam</MenuItem>
              <MenuItem value={"MM"}>Myanmar</MenuItem>
              <MenuItem value={"LA"}>Laos</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="start" my={3}>
          <Box mr={2} sx={{ borderRadius: 5, overflow: "hidden", flex: 1 }}>
            {!dataPM25 ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
              </Box>
            ) : (
              <Chart width={"100%"} height={600} chartType="LineChart" data={chartData} options={LineOptions} />
            )}
          </Box>
          <Box height={20} />
          <Box sx={{ borderRadius: 5, overflow: "hidden", flex: 1 }}>
            <MUIDataTable
              title={<h3>Air Quality Index (PM 2.5) for Given Date{dateTitle}</h3>}
              data={tableData}
              columns={columns}
              options={options}
            />
          </Box>
        </Box>
      </Container>
    </>
  );
}

export default PM25;
