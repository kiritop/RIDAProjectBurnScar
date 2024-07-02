import * as React from "react";
import { Container, Card, CardContent, Grid, Typography, CardMedia, CardActionArea, Button } from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { useNavigate } from "react-router-dom";

const Carddetail = [
  {
    img: "unit1.PNG",
    id: 1,
    title: "Types and Characteristics of Satellites",
    pdf: "/CH1_.pdf",
    links: [
      { EP: "EP 01 What is an orbit?", yt: "https://www.youtube.com/watch?v=N-JiWH2zKio" },
      { EP: "EP 02 Satellite orbit", yt: "https://www.youtube.com/watch?v=mnAHec9-Akc" },
      { EP: "EP 03 Satellite orbital levels", yt: "https://www.youtube.com/watch?v=woE0iM8ugeA" },
      { EP: "EP 04 Passive and Active satellite systems", yt: "https://www.youtube.com/watch?v=KqcHy82FlX4" },
      {
        EP: "EP 05 Knowledge about satellites (Landsat-8, Sentinel-1, Sentinel-2)",
        yt: "https://www.youtube.com/watch?v=2JzrQ7c8c9Q",
      },
      {
        EP: "EP 06 Examples of satellite images (Landsat-8, Sentinel-1, Sentinel-2)",
        yt: "https://www.youtube.com/watch?v=4DvyiM4jwNA",
      },
      { EP: "Chapter 01 Types and Characteristics of Satellites.pdf", yt: "/rida-project/CH1_.pdf" },
    ],
  },
  {
    img: "unit2.PNG",
    id: 2,
    title: "Interpretation and Analysis of Satellite Data",
    pdf: "/CH2_.pdf",
    links: [
      { EP: "EP 01 How can ground stations communicate with satellites?", yt: "https://www.youtube.com/watch?v=IGwlUxhU2kA" },
      { EP: "EP 02 Characteristics of data from satellite images", yt: "https://www.youtube.com/watch?v=l8blwGOrTgs" },
      { EP: "EP 03 Analyzing satellite images using indices", yt: "https://www.youtube.com/watch?v=RGOUn2DNvhg" },
      { EP: "Chapter 02 Interpretation and Analysis of Satellite Data.pdf", yt: "/rida-project/CH2_.pdf" },
    ],
  },
  {
    img: "unit3.PNG",
    id: 3,
    title: "Application of Satellite Data",
    pdf: "/CH3_.pdf",
    links: [
      { EP: "EP 01 Geo-Informatics technology", yt: "https://www.youtube.com/watch?v=lp2Uu23_qLY" },
      { EP: "EP 02 Remote Sensing", yt: "https://www.youtube.com/watch?v=8KPA-wz64QY" },
      { EP: "EP 03 Global Positioning System", yt: "https://www.youtube.com/watch?v=MpBb_h9ckNM" },
      { EP: "Chapter 03 Application of Satellite Data.pdf", yt: "/rida-project/CH3_.pdf" },
    ],
  },
  {
    img: "unit4.PNG",
    id: 4,
    title: "Machine Learning",
    pdf: "/CH4_.pdf",
    links: [
      { EP: "EP 01 What is Machine Learning?", yt: "https://www.youtube.com/watch?v=GUWELDMWS2Y" },
      { EP: "EP 02 Machine Learning concepts", yt: "https://www.youtube.com/watch?v=iUAA9xvWrHM" },
      { EP: "EP 03 Types of Machine Learning", yt: "https://www.youtube.com/watch?v=Hz1O-D1oPHI" },
      { EP: "EP 04 Models and Algorithms of Machine Learning", yt: "https://www.youtube.com/watch?v=Mpnzvqp74bk" },
      { EP: "EP 05 Applications of Machine Learning", yt: "https://www.youtube.com/watch?v=dfsMdUIZHrw" },
      { EP: "Chapter 04 Machine Learning.pdf", yt: "/rida-project/CH4_.pdf" },
    ],
  },
];

function Course() {
  const navigate = useNavigate();

  const handlePdfClick = (pdfLink) => {
    if (pdfLink) {
      window.open("/rida-project"+pdfLink, "_blank");
    }
  };

  const handleYoutubeClick = (youtubeLink) => {
    window.open(youtubeLink, "_blank");
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
          Learning Materials
        </Typography>
      </Grid>

      <Grid container spacing={3}>
        {Carddetail.map((e, index) => (
          <Grid item xs={3} key={index}>
            <Card sx={{ maxWidth: 500, padding: "6px", borderRadius: 5, paddingBottom: 3 }}>
              <CardActionArea onClick={() => handlePdfClick(e.pdf)}>
                <CardMedia
                  component="img"
                  height="200"
                  image={process.env.PUBLIC_URL + '/' + e.img}
                  alt={`unit${index + 1}`}
                  sx={{ borderRadius: 5 }}
                />
                <CardContent sx={{ height: "5vh" }}>
                  <Typography variant="h6">Chapter {index + 1}</Typography>
                  <Typography variant="body2" color={"text.secondary"}>
                    {e.title}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardContent>
                {e.links.map((link, idx) => (
                  <div key={idx}>
                    <Button
                      variant="text"
                      onClick={() => handleYoutubeClick(link.yt)}
                      sx={{ fontSize: "12px", textAlign: 'left' }}
                      startIcon={<PlayCircleOutlineIcon />}
                    >
                      {link.EP}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Course;
