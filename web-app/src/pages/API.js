import React from "react";
import axios from "axios";
import Container from "@mui/material/Container";
import { Box, Grid, Button, TextField } from "@mui/material";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import DataTable from "./tableShapefile";
import Swal from "sweetalert2";
import { useSelector, useDispatch } from "react-redux";
import { fetchUsers } from "../reducers/userSlice";


const spec = {
  openapi: "3.0.0",
  info: {
    title: "API DOCUMENT",
  },
  paths: {
    "/get-users": {
      get: {
        tags: ["API LIST"],
        summary: "user info",
        description: "user list.",
        responses: {
          200: {
            description: "Successfully read the user info.",
          },
        },
      },
    },
  },
};

function API() {
  const email = JSON.parse(localStorage.getItem("myData"));
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.data ?? []);
  const getfile = useSelector((state) => state.getfile);
  const apikey = users[0]?.api_key ?? [];
  console.log(getfile);

  React.useEffect(() => {
    dispatch(fetchUsers());   
  }, [dispatch]);

  const apiGen = async () => {
    if (!email) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please login first!",
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

    const payload = {
      email: email,
    };

    try {
      const response = await axios.post("http://localhost:3000/api/generate", payload);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Generate API KEY done",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.reload();
      }
    });
  };

  return (
    <>
      <Container maxWidth="lg">
        <Grid container direction="row" justifyContent="space-between" alignItems="center" mt={5}>
          {console.log(users)}

          <>
            {/* <Box>{users?.data[0]?.api_key ?? []}</Box> */}
            <Grid spacing={0}>
              <TextField
                sx={{ width: "200%" }}
                id=""
                label=""
                placeholder="If not have API KEY click Generate KEY button"
                value={apikey}
                onChange={""}
              />
            </Grid>
          </>

          <Button variant="contained" onClick={apiGen}>
            Generate KEY
          </Button>
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
