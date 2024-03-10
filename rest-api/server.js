const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const shapefile = require('shapefile');
const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');

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
  // const shapefilePath = './output/USA Fire Predicted GIS file/USA_Fire_Predicted.shp';
  const shapefilePath = './output/layers/POINT.shp';

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
        if (result.done || featureCount >= totalFeatures / 20) return;
        features.push(result.value);
        featureCount++;
        return source.read().then(log);
      })
    );

  res.json(features);
});


server.get('/process-shapefiles', async (req, res) => {
  let data = [];
  const directoryPath = path.join(__dirname, './output/demo');
  fs.readdir(directoryPath, function (err, files) {
      if (err) {
          return console.log('Unable to scan directory: ' + err);
      } 
      let promises = [];
      files.forEach(function (file) {
          if(path.extname(file) === '.zip'){
              let promise = new Promise((resolve, reject) => {
                  fs.createReadStream(directoryPath + '/' + file)
                      .pipe(unzipper.Parse())
                      .on('entry', function (entry) {
                          const fileName = entry.path;
                          const type = entry.type; // 'Directory' or 'File'
                          if (type === 'File' && fileName.includes('layers') && fileName.endsWith('.shp')) {
                              shapefile.read(entry)
                                  .then(geojson => {
                                      geojson.features.forEach(feature => {
                                          const latlong = feature.geometry.coordinates.join(',');
                                          const year = file.split('_')[1];
                                          data.push({ type: feature.type, coordinates: latlong, properties: { ...feature.properties, count: 1, year: [year] }, geometry: feature.geometry});
                                      });
                                      resolve();
                                  })
                                  .catch(err => {
                                      console.error(err);
                                      reject(err);
                                  });
                          } else {
                              entry.autodrain();
                          }
                      });
              });
              promises.push(promise);
          }
      });
      Promise.all(promises)
          .then(() => {
              let finalData = [];
              data.forEach(item => {
                  let found = finalData.find(d => d.coordinates === item.coordinates);
                  if (!found) {
                      finalData.push(item);
                  } else {
                      found.properties.count++;
                      if (!found.properties.year.includes(item.properties.year[0])) {
                          found.properties.year.push(item.properties.year[0]);
                      }
                  }
              });

              // Calculate the percentage of duplicates for each row
              finalData.forEach(row => {
                // Use the formula (count / files.length) * 100 and round to two decimals
                let percentage = ((row.properties.count / files.length) * 100).toFixed(2);
                // Add the percentage to the properties as frequency
                row.properties.frequency = percentage;
              });
              console.log("files.length", files.length)
              // Define an array of offsets for the four directions
              // You can change the values as you wish
              // The unit is degree
              let offsets = [
                { dx: 0, dy: 0.0005 }, // up
                { dx: 0, dy: -0.0005 }, // down
                { dx: -0.0005, dy: 0 }, // left
                { dx: 0.0005, dy: 0 } // right
              ];

              // Loop through the final data array
              finalData.forEach(row => {
                // Loop through the offsets array
                offsets.forEach(offset => {
                  // Split the coordinates string into an array of numbers
                  let coords = row.coordinates.split(',').map(Number);
                  // Add the offset to the original coordinates
                  let newCoords = [coords[0] + offset.dx, coords[1] + offset.dy];
                  // Create a new geojson object for the new point
                  let newPoint = {
                    "type": "Feature",
                    "properties": {
                      // Copy the properties from the original point
                      ...row.properties,
                      // Add a new property to indicate that this is an artificial point
                      "artificial": true
                    },
                    "geometry": {
                      "type": "Point",
                      "coordinates": newCoords
                    }
                  };
                  // Add the new point to the final data array
                  finalData.push(newPoint);
                });
              }); 
              res.json(finalData); // Send the data as JSON
          })
          .catch(err => {
              console.log(err);
              res.status(500).send('An error occurred while processing the shapefiles.');
          });
  });
});




server.listen(3000, function () {
  console.log('Server Listen at http://localhost:3000');
});