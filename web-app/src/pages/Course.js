import * as React from "react";
import Header from "../components/Header";
import { Container, Card, CardContent, Grid, Typography, CardMedia, CardActionArea } from "@mui/material";

const Carddetail = [
  {
    img: "unit1.png",
    title: "Unit 1 Types and properties of satellites",
    desc: "Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all",
  },
  {
    img: "unit2.png",
    title: "Unit 2 Translating and analyzing satellite data",
    desc: "Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all",
  },
  {
    img: "unit3.png",
    title: "Unit 3 Application of satellite data",
    desc: "Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all",
  },
  {
    img: "unit4.png",
    title: "Unit 4 Material Learning",
    desc: "Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all",
  },
];

function Course() {
  return (
    <div
      style={{
        backgroundColor: "#E0FBFF",
        height: "100vh",
      }}
    >
      <Header />

      <Container maxWidth="lg" sx={{}}>
        <Grid
          container
          spacing={1}
          direction="row"
          justifyContent="center"
          alignItems="center"
          alignContent="center"
          wrap="wrap"
          my={5}
          sx={{ backgroundColor: "#0B259C", padding: 3 }}
        >
          <Typography variant="h2" color="#fff" sx={{ fontFamily: "monospace" }}>
            Learning Material
          </Typography>
        </Grid>

        <Grid container spacing={3}>
          {Carddetail.map((e, index) => (
            <Grid item xs={3} key={index}>
              <Card sx={{ maxWidth: 400, height: 500 }}>
                <CardActionArea>
                  <CardMedia component="img" height="200" image={e.img} alt="unit1" />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      <h4>{e.title}</h4>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all
                      continents except Antarctica
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
}

export default Course;
