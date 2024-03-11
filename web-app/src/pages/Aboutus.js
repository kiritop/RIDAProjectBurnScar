import * as React from "react";
import Box from "@mui/material/Box";
import Header from "../components/Header";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";

function AboutUS() {
  // Define your array of items
  const items = [
    {
      name: "Asst.Prof.Surapol Vorapatratorn, PhD",
      role: "Project Leader",
      imageUrl: "user.png",
    },
    {
      name: "Dr.Tossapon Boongoen ",
      role: "Researcher",
      imageUrl: "user.png",
    },
    {
      name: "Dr. surapol worapattratorn",
      role: "Project Leader",
      imageUrl: "user.png",
    },
    {
      name: "Dr. surapol worapattratorn",
      role: "Project Leader",
      imageUrl: "user.png",
    },
    {
      name: "Dr. surapol worapattratorn",
      role: "Project Leader",
      imageUrl: "user.png",
    },
    {
      name: "Dr. surapol worapattratorn",
      role: "Project Leader",
      imageUrl: "user.png",
    },

    // Add more items as needed
  ];
  return (
    <>
      <Header />
      <Box height={20} />
      <Container maxWidth="lg">
        <center>
          <h1>About US</h1>
        </center>
        <Grid container spacing={3}>
          {items.map((item, index) => (
            <Grid key={index} xs={12} sm={6} md={4} item>
              <Card sx={{ maxWidth: 360, boxShadow: "none" }}>
                {/* Card media for the image */}

                <center>
                  <CardMedia
                    sx={{ height: 100, width: 100, borderRadius: 10 }} // Set the height and width to make the image smaller
                    image={item.imageUrl} // Use item's imageUrl
                    title={item.name} // Use item's name as the title
                  />
                </center>

                {/* Card content for text */}
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div" align="center">
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {item.role}
                  </Typography>
                </CardContent>

                {/* Card actions */}
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}

export default AboutUS;
