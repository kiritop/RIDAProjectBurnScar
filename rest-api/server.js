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
  const shapefilePath = './output/2023/2023.shp';

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
  // Get the parameters from the request
  // let startYear = req.query.startYear;
  // let endYear = req.query.endYear;
  // let country = req.query.country;
  // let province = req.query.province;

  // // Validate the parameters
  // if (!startYear || !endYear || !country || !province) {
  //     return res.status(400).send('Missing required parameters.');
  // }

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
                                      console.log('1')
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
                row.properties.total_shapefile = files.length;
              });
              console.log("files.length", files.length)
              
              res.json(finalData); // Send the data as JSON
          })
          .catch(err => {
              console.log(err);
              res.status(500).send('An error occurred while processing the shapefiles.');
          });
  });
});


server.get('/process-shapefiles-demo', async (req, res) => {
    const directoryPath = path.join(__dirname, './output/Burn');
    let totalShpFile = 0; // keep total of shapefile
    fs.readdir(directoryPath, function (err, folders) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        let promises = folders.map(function (folder) {
            const folderPath = path.join(directoryPath, folder);
            return fs.promises.readdir(folderPath)
                .then(files => {
                    return files.reduce((promiseChain, file) => {
                        if(path.extname(file) === '.shp'){
                            return promiseChain.then(() => shapefile.read(path.join(folderPath, file))
                                .then(geojson => {
                                    totalShpFile++
                                    return geojson.features.map(feature => {
                                        const latlong = feature.geometry.coordinates.join(',');
                                        const year = folder;
                                        return { type: feature.type, coordinates: latlong, properties: { ...feature.properties, count: 1, year: [year] }, geometry: feature.geometry};
                                    });
                                }));
                        } else {
                            return promiseChain;
                        }
                    }, Promise.resolve([]));
                });
        });
        Promise.all(promises)
            .then(dataArrays => {
                let data = [].concat(...dataArrays);
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
                  // Use the formula (count / totalShpFile) * 100 and round to two decimals
                  let percentage = ((row.properties.count / totalShpFile) * 100).toFixed(2);
                  // Add the percentage to the properties as frequency
                  row.properties.frequency = percentage;
                  row.properties.total_shapefile = totalShpFile;
                });
                console.log("totalShpFile", totalShpFile)
                
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