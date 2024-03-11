import React from "react";
import Header from "../components/Header";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

// import SwaggerUI from "swagger-ui-react";

function API() {
  return (
    <>
      <Header />
      <Container maxWidth="lg">
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
          <h1> API</h1>
          <Button variant="contained" color="primary">
          Generate Token 
          </Button>
        </Grid>
        <Box height={30} />

        <Box sx={{ border: "1px solid #e5e5e5", borderRadius: 2, padding: "10px" }}>
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
            <Grid item xs={2}>
              {/* Define specific sizes for grid items */}
              <IconButton aria-label="delete">
                <DeleteIcon /> {/* Render the delete icon */}
              </IconButton>
            </Grid>
          </Grid>
        </Box>

        <Box height={30} />
        <Box sx={{ border: "1px solid #e5e5e5", borderRadius: 2, padding: "10px" }}>
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
              /read-shapefile-half
            </Grid>
            <Grid item xs={2}>
              {/* Define specific sizes for grid items */}
              <IconButton aria-label="delete">
                <DeleteIcon /> {/* Render the delete icon */}
              </IconButton>
            </Grid>
          </Grid>
        </Box>
        {/* <SwaggerUI url="http://petstore.swagger.io/v2/swagger.json" /> */}
      </Container>
    </>
  );
}
export default API;
