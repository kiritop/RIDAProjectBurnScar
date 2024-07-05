import * as React from "react";
import Box from "@mui/material/Box";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";

function AboutUS() {

  const partners = [
    {
      imageUrl : "logo1.png"
    },
    {
      imageUrl : "logo2.png"
    },
    {
      imageUrl : "logo3.png"
    },
    {
      imageUrl : "logo4.png"
    },
    {
      imageUrl : "logo5.png"
    },
    {
      imageUrl : "logo6.png"
    },
  ]
  // Define your array of items
  const items = [
    {
      name: "Asst.Prof.Dr.Surapol Vorapatratorn",
      role: "Project Leader (TH)",
      institution: "Mae Fah Luang University",
      imageUrl: "surapong.png",
    },
    {
      name: "Prof.Tossapon Boongoen",
      role: "Project Leader (UK)",
      institution: "Aberystwyth University",
      imageUrl: "tob45.jpg",
    },
    {
      name: "Assoc.Prof.Dr.Natthakan Iam-on",
      role: "Researcher",
      institution: "Aberystwyth University",
      imageUrl: "nai7.jpg",
    },
    {
      name: "Dr.Khwunta Kirimasthong",
      role: "Researcher",
      institution: "Mae Fah Luang University",
      imageUrl: "patt.png",
    },
    {
      name: "Nontawat Thongsibsong",
      role: "Researcher",
      institution: "Mae Fah Luang University",
      imageUrl: "ball.png",
    },
    {
      name: "Tunyavee Saokomket",
      role: "Research Assistant",
      institution: "Mae Fah Luang University",
      imageUrl: "dew.jpg",
    },
    {
      name: "Siripoom Suwanmanee",
      role: "Research Assistant",
      institution: "Mae Fah Luang University",
      imageUrl: "poom.jpg",
    },
    {
      name: "Rutathorn Woraphatthada",
      role: "Research Assistant",
      institution: "Mae Fah Luang University",
      imageUrl: "best.jpg",
    },
    {
      name: "Chutipon Pimsarn",
      role: "Research Assistant",
      institution: "Mae Fah Luang University",
      imageUrl: "top.jpg",
    },
    {
      name: "Prof.Qiang Shen",
      role: "Researcher",
      institution: "Aberystwyth University",
      imageUrl: "Prof_Qiang_Shen.jpg",
    },
    {
      name: "Prof.Reyer Zwiggelaar",
      role: "Researcher",
      institution: "Aberystwyth University",
      imageUrl: "Prof_Reyer_Zwiggelaar.jpg",
    },
    {
      name: "Dr.Changjing Shang",
      role: "Researcher",
      institution: "Aberystwyth University",
      imageUrl: "Dr_Changjing_Shang.jpg",
    },
    {
      name: "Dr.Kampanat Deeudomchan",
      role: "Specialist",
      institution: "Chief of Division, Geo-Informatics Management and Solutions Office, GISTDA",
      imageUrl: "p_pepsi.jpeg",
    },
    {
      name: "Jittisak Yodcum",
      role: "Specialist",
      institution: "Forest Fire Control Division, Forest Protection and Fire Control Bureau, Department of Forestry",
      imageUrl: "p_yok.jpg",
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

        <center>
        
          <Box
            my={3}
            sx={{
              width: 300,
              height: 300,
              backgroundImage: "url('logo_m.png')",
              borderRadius: "50%",
              overflow: "hidden",
            }}
          />
          
        </center>
        <Typography variant="h4">
          Temporal-based burnt scar profiling for modeling risk of forest fires in ASEAN mainland
          
        </Typography>

        <Typography variant="h5">
          
          Project to develop a burn area detection and analysis system from satellite images as well Academic learning
          technology To increase the efficiency of forest management planning and the risks of forest fire , funding by Research and Innovation for
          Development in ASEAN (RIDA)
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
        <Typography variant="h6">
          <p>
            1. The prototype of the burnt scar profiling system and associated libraries of programs implementing:
            data loading, data pre-processing, burnt scar detection, aggregation of temporal-based detection
            results, risk assessment and visualisation (as a spatial layer of measurement that complies with the
            specification of GISTDA’s online map platform).
          </p>
          <p>2. The prototype of a new method to improve the performance of the previous detection model,
            with a report of experiments on datasets purposefully collected by GISTDA for this project.
          </p>
          <p>3. The demonstration and assessment of GISTDA’s online map with the visualisation of risk metric
            obtained in 1., by experts of GISTDA, DoF and representatives of other ASEAN countries. This is to
            be carried out using data and case studies specific to the scope of study (covering northern Thailand
            and areas of neighbouring countries).
          </p>
          <p>4. Two technical workshops (at GISTDA and MFU) for other user organisations (governmental and
            industrial), community representatives, researchers, and the public. These will promote the applicability
            of this system as well as the dissemination of knowledge and tools within the community of practice.
          </p>
          <p>5. Publication of the techniques and system developed in this project: one draft of a journal article and
            another draft for international conference presentation
          </p>
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
            About Us
          </Typography>
        </Grid>
        <Grid container spacing={3} mt={4}>
          {items.map((item, index) => (
            <Grid key={index} xs={12} sm={6} md={4} mx={"auto"} item>
              <Card
                sx={{
                  maxWidth: 500,
                  boxShadow: "none",
                  
                  backgroundColor: "transparent",
                  marginInline: "auto",
                }}
              >
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div style={{ borderRadius: "50%", overflow: "hidden", width: 200 }}>
                    <CardMedia sx={{ height: 200 }} image={item.imageUrl} />
                  </div>
                </div> 
                <CardContent sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <Typography gutterBottom variant="h6" component="div" align="center">
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {item.role}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {item.institution}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

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
            Our Partners
          </Typography>
        </Grid>
        <Grid container spacing={3} mt={4}>
          {partners.map((item, index) => (
            <Grid key={index} xs={12} sm={6} md={4} mx={"auto"} item>
              <Card
                sx={{
                  maxWidth: 500,
                  boxShadow: "none",
                  
                  backgroundColor: "transparent",
                  marginInline: "auto",
                }}
              >
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div style={{ overflow: "hidden", width: '100%' }}>
                    <CardMedia component="img" sx={{ height: 200, objectFit: 'contain' }} image={item.imageUrl} />
                  </div>
                </div> 
                
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
              Contact Us
            </Typography>
          </Grid>
          <Grid spacing={0} my={5}>
            <Container maxWidth="lg">
              <center>
              <Typography variant="h5" align="center">
                Center of Excellence in AI and Emerging Technology
                </Typography>
                <Typography variant="h5" align="center">
               School of Information Technology, Mae Fah Luang University
                </Typography>
                <Box
                  my={3}
                  sx={{
                    width: 300,
                    height: 300,
                    backgroundImage: "url('LOGO-AIE _New.png')",
                    borderRadius: "50%",
                    overflow: "hidden",
                  }}
                />
                <Typography variant="body1" mt={4}>
                  Email: aie.itschool@mfu.ac.th
                </Typography>
                <Typography variant="body1" mt={4}>
                  Address : 333 Moo 1, Thasud , Muang , Chiang Rai, Thailand 57100 
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
