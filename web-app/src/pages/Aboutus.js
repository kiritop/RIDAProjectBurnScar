import * as React from "react";
import Box from "@mui/material/Box";

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
      imageUrl: "surapong.png",
    },
    {
      name: "Assoc.Prof.Wg.Cdr.Tossapon Boongoen, PhD.",
      role: "Researcher",
      imageUrl: "toss.png",
    },
    {
      name: "Assoc.Prof.Natthakan Iam-on, PhD.",
      role: "Researcher",
      imageUrl: "oil.png",
    },
    {
      name: "Khwunta Kirimasthong, PhD",
      role: "Researcher",
      imageUrl: "patt.png",
    },
    {
      name: "Aj.Nontawat Thongsibsong",
      role: "Researcher",
      imageUrl: "ball.png",
    },

    // Add more items as needed
  ];
  return (
    <>
      <Box height={5} />
      <Container maxWidth="lg">
        <Grid
          container
          spacing={1}
          direction="row"
          justifyContent="center"
          alignItems="center"
          alignContent="center"
          wrap="wrap"
          my={5}
          sx={{ backgroundColor: "#023e8a", padding: 1, borderRadius: 3, boxShadow: 1 }}
        >
          <Typography variant="h3" color="#fff" sx={{ fontFamily: "monospace" }}>
            Project
          </Typography>
        </Grid>

        <Typography variant="body1">
          Project to develop a burn area detection and analysis system from satellite images as well Academic learning
          technology To increase the efficiency of forest management planning and the risks of forest fire
        </Typography>

        <Grid
          container
          spacing={1}
          direction="row"
          justifyContent="center"
          alignItems="center"
          alignContent="center"
          wrap="wrap"
          my={5}
          sx={{ backgroundColor: "#023e8a", padding: 1, borderRadius: 3, boxShadow: 1 }}
        >
          <Typography variant="h3" color="#fff" sx={{ fontFamily: "monospace" }}>
            Purpose
          </Typography>
        </Grid>
        <Typography variant="body1">
          <p>
            1. Develop a deep learning technology research network with Aberystwyth University, Agxio Company Ltd. and
            Northumbria University. It is supported by national research institutes such as GISTDA and DTI, which
            emphasize its use in remote sensing data analysis.
          </p>
          <p>2. Develop a network of users/stakeholders to leverage the analysis results.</p>
          <p> 3. Develop a prototype data management and analysis system.</p>
          <p> 4. Develop knowledge sharing resources for the research community.</p>
          <p> 5. Organize technical workshops to share knowledge/experience with the public.</p>
          <p>
            6. Train research staff and students on technological advances. Deep learning by international academic and
            industry partners.
          </p>
          <p> 7. Publish research results in high-impact journals.</p>
        </Typography>

        <Grid
          container
          spacing={1}
          direction="row"
          justifyContent="center"
          alignItems="center"
          alignContent="center"
          wrap="wrap"
          my={5}
          sx={{ backgroundColor: "#023e8a", padding: 1, borderRadius: 3, boxShadow: 1 }}
        >
          <Typography variant="h3" color="#fff" sx={{ fontFamily: "monospace" }}>
            About US
          </Typography>
        </Grid>
        <Grid container spacing={3} mt={4}>
          {items.map((item, index) => (
            <Grid key={index} xs={12} sm={6} md={4} mx={"auto"} item>
              <Card
                sx={{
                  maxWidth: 500,
                  boxShadow: "none",
                  height: "35vh",
                  backgroundColor: "transparent",
                  marginInline: "auto",
                }}
              >
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div style={{ borderRadius: "50%", overflow: "hidden", width: 200, height: 200 }}>
                    <CardMedia component="img" sx={{ height: 200 }} image={item.imageUrl} />
                  </div>
                </div>
                <CardContent sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <Typography gutterBottom variant="h6" component="div" align="center">
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {item.role}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box>
          <Grid
            container
            spacing={1}
            direction="row"
            justifyContent="center"
            alignItems="center"
            alignContent="center"
            wrap="wrap"
            my={5}
            sx={{ backgroundColor: "#023e8a", padding: 1, borderRadius: 3, boxShadow: 1 }}
          >
            <Typography variant="h3" color="#fff" sx={{ fontFamily: "monospace" }}>
              Contact US
            </Typography>
          </Grid>
          <Grid spacing={0} my={5}>
            <Container maxWidth="lg">
              <center>
                <Typography variant="h5" align="center">
                  Information Technology Mae Fah Luang University (E3 Building)
                </Typography>
                <Box
                  my={3}
                  sx={{
                    width: 300,
                    height: 300,
                    backgroundImage: "url('surapong.png')",
                    borderRadius: "50%",
                    overflow: "hidden",
                  }}
                />
                <Typography variant="h5" align="center">
                  Asst.Prof.Surapol Vorapatratorn, PhD
                </Typography>
                <Typography variant="body1" mt={4}>
                  Address : 333 m 1 Thah sud , mueng , chiang rai 57100
                </Typography>
              </center>
            </Container>
          </Grid>
        </Box>
      </Container>
    </>
  );
}

export default AboutUS;
