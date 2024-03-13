import React from "react";

import Container from "@mui/material/Container";
import { Box, Grid, Button } from "@mui/material";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import DataTable from "./tableShapefile";

const spec = {
  openapi: "3.0.0",
  info: {
    title: "API DOCUMENT",
  },
  paths: {
    "/read-shapefile": {
      get: {
        tags: ["API LIST"],
        summary: "Reads a shapefile",
        description: "This endpoint reads a shapefile.",
        responses: {
          200: {
            description: "Successfully read the shapefile.",
          },
        },
      },
    },
    "/read-shapefile-half": {
      get: {
        tags: ["API LIST"],
        summary: "Reads half of a shapefile",
        description: "This endpoint reads half of a shapefile.",
        responses: {
          200: {
            description: "Successfully read half of the shapefile.",
          },
        },
      },
    },
  },
};

function API() {
  return (
    <>
      <Container maxWidth="lg">
        <Grid container direction="row" justifyContent="end" alignItems="center" mt={5}>
          <Button variant="contained">Generate KEY</Button>
        </Grid>
        <Box height={"5vh"} />

        <Box sx={{ backgroundColor: "#fff", borderRadius: 5, padding: "1rem", boxShadow: 3 }}>
          <SwaggerUI spec={spec} />
        </Box>

        <Box height={30} />
        <DataTable />
        <Box height={30} />
      </Container>
    </>
  );
}
export default API;
