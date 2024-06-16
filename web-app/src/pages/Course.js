import * as React from "react";
import { Container, Card, CardContent, Grid, Typography, CardMedia, CardActionArea, Button } from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";

const Carddetail = [
  {
    img: "unit1.PNG",
    id: 1,
    title: "Types and Characteristics of Satellites",
    links: [
      { EP: "EP 01 What is an orbit?", yt: "https://www.youtube.com/watch?v=unTeFqxys7w" },
      { EP: "EP 02 Satellite orbit", yt: "https://www.youtube.com/watch?v=NocgY3d7Ngo" },
      { EP: "EP 03 Satellite orbital levels", yt: "https://www.youtube.com/watch?v=SIKS17tIcy0" },
      { EP: "EP 04 Passive and Active satellite systems", yt: "https://www.youtube.com/watch?v=kdiO_fnSE2Y" },
      {
        EP: "EP 05 Knowledge about satellites (Landsat-8, Sentinel-1, Sentinel-2)",
        yt: "https://www.youtube.com/watch?v=6W4_L0RueLY",
      },
      {
        EP: "EP 06 Examples of satellite images (Landsat-8, Sentinel-1, Sentinel-2)",
        yt: "https://www.youtube.com/watch?v=DhWIf1vDh9Y",
      },
    ],
  },
  {
    img: "unit2.PNG",
    id: 2,
    title: "Interpretation and Analysis of Satellite Data",
    links: [
      { EP: "EP 01 How can ground stations communicate with satellites?", yt: "https://www.youtube.com/watch?v=_u_E3XCxUrQ" },
      { EP: "EP 02 Characteristics of data from satellite images", yt: "https://www.youtube.com/watch?v=KkaXCU2QqC0" },
      { EP: "EP 03 Analyzing satellite images using indices", yt: "https://www.youtube.com/watch?v=97vVaI1qV1A" },
    ],
  },
  {
    img: "unit3.PNG",
    id: 3,
    title: "Application of Satellite Data",
    links: [
      { EP: "EP 01 Geo-Informatics technology", yt: "https://www.youtube.com/watch?v=SF3xTIOFMYk" },
      { EP: "EP 02 Remote Sensing", yt: "https://www.youtube.com/watch?v=0YTgEarG_Eo" },
      { EP: "EP 03 Global Positioning System", yt: "https://www.youtube.com/watch?v=2wsc97KvH40" },
    ],
  },
  {
    img: "unit4.PNG",
    id: 4,
    title: "Machine Learning",
    links: [
      { EP: "EP 01 What is Machine Learning?", yt: "https://www.youtube.com/watch?v=grHroUVZwgQ" },
      { EP: "EP 02 Machine Learning concepts", yt: "https://www.youtube.com/watch?v=l8r-VWJJL3g" },
      { EP: "EP 03 Types of Machine Learning", yt: "https://www.youtube.com/watch?v=e4SW5T8o58g" },
      { EP: "EP 04 Models and Algorithms of Machine Learning", yt: "https://www.youtube.com/watch?v=4hqhGBntsqA" },
      { EP: "EP 05 Applications of Machine Learning", yt: "https://www.youtube.com/watch?v=Y4afzOWGDic" },
    ],
  },
];

function Course() {
  const pdfLinks = {
    1: "/CH1_.pdf",
    2: "/CH2_.pdf",
    3: "/CH3_.pdf",
    4: "/CH4_.pdf",
  };

  return (
    <Container maxWidth="xl">
      <Grid
        container
        spacing={1}
        direction="row"
        justifyContent="center"
        alignItems="center"
        alignContent="center"
        wrap="wrap"
        my={5}
        sx={{ backgroundColor: "#023e8a", padding: 3, borderRadius: 3, boxShadow: 1 }}
      >
        <Typography variant="h3" color="#fff" sx={{ fontFamily: "monospace" }}>
          Learning Material
        </Typography>
      </Grid>

      <Grid container spacing={3}>
        {Carddetail.map((e, index) => (
          <Grid item xs={3} key={index}>
            <Card sx={{ maxWidth: 500, padding: "6px", borderRadius: 5, paddingBottom: 3 }}>
              <CardActionArea href={pdfLinks[e.id]} target="_blank">
                <CardMedia
                  component="img"
                  height="200"
                  image={process.env.PUBLIC_URL + '/' + e.img}
                  alt={`unit${index + 1}`}
                  sx={{ borderRadius: 5 }}
                />
                <CardContent sx={{ height: "5vh" }}>
                  <Typography variant="h6">Unit {index + 1}</Typography>
                  <Typography variant="body2" color={"text.secondary"}>
                    {e.title}
                  </Typography>
                </CardContent>
                <CardContent>
                  {e.links.map((link, index) => (
                    <div key={index}>
                      <Button
                        variant="text"
                        href={link.yt}
                        target="_blank"
                        sx={{ fontSize: "12px" }}
                        startIcon={<PlayCircleOutlineIcon />}
                      >
                        {link.EP}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Course;
