import React from "react";

import Container from "@mui/material/Container";
import { Box, Grid, Button, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EnhancedTable from "./tableShapefile";
import DataTable from "./tableShapefile";

// import SwaggerUI from "swagger-ui-react";

const columns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "name", headerName: "Name", width: 130 },
  { field: "dateAcquired", headerName: "Date Acquired", width: 130 },
  { field: "processDate", headerName: "Process Date", width: 130 },
  {
    field: "download",
    headerName: " ",
    width: 130,
    renderCell: (params) => (
      <Button variant="contained" color="primary">
        Download
      </Button>
    ),
  },
];

const rows = [
  { id: 1, name: "S2A_MSIL2A...", dateAcquired: "20/04/23", processDate: "20/04/23" },
  { id: 2, name: "S2A_MSIL2A...", dateAcquired: "19/04/23", processDate: "19/04/23" },
  // add more rows as needed
];

function API() {
  return (
    <>
      <Container maxWidth="lg">
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
          <h1> API</h1>
          <Button variant="contained">Generate KEY</Button>
        </Grid>
        <Box height={30} />

        <Box sx={{ border: "3px solid #e5e5e5", borderRadius: 2, padding: "10px", backgroundColor: "#fff" }}>
          {/* Apply border and padding */}
          <Grid container spacing={2} alignItems="center">
            {/* Use a grid layout with spacing and align items */}
            <Grid item xs={2}>
              {/* Define specific sizes for grid items */}
              <Button variant="outlined" color="primary" sx={{ borderRadius: 2 }}>
                {/* Apply button style */}
                GET
              </Button>
            </Grid>
            <Grid item xs={8}>
              {/* Define specific sizes for grid items */}
              /read-shapefile
            </Grid>
            {/* <Grid item xs={2}>
              <IconButton aria-label="delete">
                <DeleteIcon /> 
              </IconButton>
            </Grid> */}
          </Grid>
        </Box>

        <Box height={30} />
        <Box sx={{ border: "3px solid #e5e5e5", borderRadius: 2, padding: "10px", backgroundColor: "#fff" }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={2}>
              <Button variant="outlined" color="primary" sx={{ borderRadius: 2 }}>
                {/* Apply button style */}
                GET
              </Button>
            </Grid>
            <Grid item xs={8}>
              /read-shapefile-half
            </Grid>
            {/* <Grid item xs={2}>
              <IconButton aria-label="delete">
                <DeleteIcon /> 
              </IconButton>
            </Grid> */}
          </Grid>
        </Box>
        <Box height={30} /> 
        <DataTable />
      </Container>
    </>
  );
}
export default API;
