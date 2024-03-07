const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const AdmZip = require('adm-zip');
const shapefile = require('shapefile');

let server = express();
server.use(bodyParser.json());  // ให้ server(express) ใช้งานการ parse json
server.use(morgan('dev')); // ให้ server(express) ใช้งานการ morgam module
server.use(cors()); // ให้ server(express) ใช้งานการ cors module


server.get('/read-shapefile', async (req, res) => {
  // Assuming the zipfile is in the same directory as your script
  // const zip = new AdmZip('./data/USA Fire Predicted GIS file-20240228T171559Z-001.zip');

  // Extract all files to /output directory
  // zip.extractAllTo('./output', /*overwrite*/true);

  // Assuming the shapefile is named 'shapefile.shp'
  const shapefilePath = './output/USA Fire Predicted GIS file/USA_Fire_Predicted.shp';

  let features = [];
  await shapefile.open(shapefilePath)
      .then(source => source.read()
          .then(function log(result) {
              if (result.done) return;
              features.push(result.value);
              return source.read().then(log);
          })
      );

  res.json(features);
});

server.get('/read-shapefile-half', async (req, res) => {
  const shapefilePath = './output/USA Fire Predicted GIS file/USA_Fire_Predicted.shp';

  // First, count the total number of features
  let totalFeatures = 0;
  await shapefile.open(shapefilePath)
    .then(source => source.read()
      .then(function count(result) {
        if (result.done) return;
        totalFeatures++;
        return source.read().then(count);
      })
    );

  // Then, read only 10% of the features
  let features = [];
  let featureCount = 0;
  await shapefile.open(shapefilePath)
    .then(source => source.read()
      .then(function log(result) {
        if (result.done || featureCount >= totalFeatures / 2) return;
        features.push(result.value);
        featureCount++;
        return source.read().then(log);
      })
    );

  res.json(features);
});





server.listen(3000, function () {
  console.log('Server Listen at http://localhost:3000');
});