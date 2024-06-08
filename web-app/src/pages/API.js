import React, { useEffect } from "react";
import Container from "@mui/material/Container";
import { Box, Button, TextField } from "@mui/material";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import DataTable from "./tableShapefile";
import Swal from "sweetalert2";
import { useSelector, useDispatch } from "react-redux";
import { fetchUsers, generateApiKey } from "../reducers/userSlice";


const spec = {
  openapi: "3.0.0",
  info: {
    title: "BURNT SCAR API DOCUMENT",
  },
  servers: [
    {
      url: "http://localhost:3000", // URL ใหม่ที่คุณต้องการให้ Swagger UI ใช้
      description: "Production server"
    }
  ],
  paths: {
    "/api/get-burnt-from-date": {
      get: {
        tags: ["API LIST"],
        summary: "Get burnt scar GeoJSON data",
        description: "This API endpoint returns GeoJSON data for burnt scars based on the provided query parameters.",
        parameters: [
          {
            in: "query",
            name: "startDate",
            schema: {
              type: "date"
            },
            description: "The starting date for the data format yyyy-mm-dd."
          },
          {
            in: "query",
            name: "endDate",
            schema: {
              type: "date"
            },
            description: "The ending date for the data format yyyy-mm-dd"
          },
          {
            in: "query",
            name: "country",
            schema: {
              type: "string"
            },
            description: "The country to filter the data. (Use ISO3)"
          },
          {
            in: "query",
            name: "province",
            schema: {
              type: "string"
            },
            description: "The province to filter the data."
          },
          {
            in: "query",
            name: "api_key",
            schema: {
              type: "string"
            },
            description: "The API key for the user."
          }
        ],
        responses: {
          '200': {
            description: "Successful operation",
            content: {
              'application/json': {
                schema: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string"
                    },
                    coordinates: {
                      type: "string"
                    },
                    properties: {
                      type: "object",
                      properties: {
                        count: {
                          type: "integer"
                        },
                        year: {
                          type: "array",
                          items: {
                            type: "string"
                          }
                        }
                      }
                    },
                    geometry: {
                      type: "object"
                    }
                  }
                }
              }
            }
          },
          '404': {
            description: "Invalid API key"
          }
        }
      }
    }
  }
};

const API = () => {
  const email = JSON.parse(localStorage.getItem("myData"));
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.data ?? []);
  const getfile = useSelector((state) => state.getfile);
  const apikey = users[0]?.api_key ?? [];
  console.log(getfile);

  useEffect(() => {
    dispatch(fetchUsers());   
  }, [dispatch]);

  const apiGen = async () => {
    if (!email) {
      Swal.fire({
        icon: "error",
        title: "PLEASE SIGN IN",
        text: "FOR GENERATE API KEY",
      });
      return;
    }
  
    if (apikey.length > 0) {
      Swal.fire({
        icon: "info",
        title: "Notice",
        text: "You already have an API key!",
      });
      return;
    }
  
    dispatch(generateApiKey(email)).then((result) => {
      if (result.type === generateApiKey.fulfilled.type) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Generate API KEY done",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
      } else if (result.type === generateApiKey.rejected.type) {
        console.error(result.payload.error);
      }
    });
  };
  return (
    <>
      <Container maxWidth="lg">
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        mt={5}
        sx={{ backgroundColor: "#fff", borderRadius: 5, padding: "1rem", boxShadow: 3 }}
      >
        <Box display="flex" justifyContent="center" flexGrow={1}>
          <TextField
            sx={{ width: "200%", mr: 1 }} // Add margin-right here
            id="api_key"
            label=""
            placeholder="If not have API KEY click Generate KEY button"
            value={apikey}
          />
        </Box>

        <Button variant="contained" onClick={apiGen}>
          Generate KEY
        </Button>
      </Box>
        <Box height={"5vh"} />

        <Box sx={{ backgroundColor: "#fff", borderRadius: 5, padding: "1rem", boxShadow: 3 }}>
          <SwaggerUI spec={spec} />
        </Box>

        {/* <Box height={30} />
        <DataTable />
        <Box height={30} /> */}
      </Container>
    </>
  );
}

export default API;
