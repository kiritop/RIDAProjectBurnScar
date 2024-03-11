import * as React from "react";
import Header from "../components/Header";
import { Container, Card, CardContent, Grid, Typography, CardMedia, CardActionArea, Box } from "@mui/material";

const Carddetail = [
  {
    img: "unit1.png",
    id: 1,
    title: "Unit 1 Types and properties of satellites",
    desc: "Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all",
  },
  {
    img: "unit2.png",
    id: 2,
    title: "Unit 2 Translating and analyzing satellite data",
    desc: "Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all",
  },
  {
    img: "unit3.png",
    id: 3,
    title: "Unit 3 Application of satellite data",
    desc: "Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all",
  },
  {
    img: "unit4.png",
    id: 4,
    title: "Unit 4 Machine Learning",
    desc: "Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all",
  },
];

function Course({ e }) {
  const handlePdfClick = (id) => {
    // This function will open the PDF file when the card is clicked
    // You can replace 'your-pdf-file.pdf' with the actual path to your PDF file
    if (id === 1) {
      window.open("/CH1_.pdf", "_blank");
    } else if (id === 2) {
      window.open("/CH2_.pdf", "_blank");
    } else if (id === 3) {
      window.open("/CH3_.pdf", "_blank");
    } else if (id === 4) {
      window.open("/CH4_.pdf", "_blank");
    }
  };
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
              <Card sx={{ maxWidth: 400, height: '25vh' }}>
                <CardActionArea onClick={() => handlePdfClick(e.id)}>
                  <CardMedia component="img" height="200" image={e.img} alt="unit1" />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      <h4>{e.title}</h4>
                    </Typography>
                    {/* <Typography variant="body2" color="text.secondary">
                      Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all
                      continents except Antarctica
                    </Typography> */}
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
