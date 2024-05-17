const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const shapefile = require("shapefile");
const fs = require("fs");
const path = require("path");
const unzipper = require("unzipper");
const archiver = require("archiver");
const mysql = require("mysql2");
const crypto = require("crypto");

// Create connection to MySQL
const db = mysql.createConnection({
  host: "10.1.29.33",
  port: '3306',
  user: "root",
  password: "gdkll,@MFU2024",
  database: "RidaDB",
});

// Connect to MySQL
db.connect((err) => {
  if (err) throw err;
  console.log("Connected to the database.");
});

let server = express();
server.use(bodyParser.json()); // ให้ server(express) ใช้งานการ parse json
server.use(morgan("dev")); // ให้ server(express) ใช้งานการ morgam module
server.use(cors()); // ให้ server(express) ใช้งานการ cors module

server.get("/api/read-shapefile", async (req, res) => {

  const shapefilePath = "./output/fire_predict_20240311_20240317/fire_predict_20240311_20240317.shp";

  let features = [];
  await shapefile.open(shapefilePath).then((source) =>
    source.read().then(function log(result) {
      if (result.done) return;
      features.push(result.value);
      return source.read().then(log);
    })
  );

  res.json(features);
});

// สร้าง endpoint สำหรับ query ข้อมูลตามช่วงวันที่
server.get('/api/get-burnt-from-date', (req, res) => {
  let startYear = req.query.start; // รับปีที่เริ่มต้นจาก query parameter
  let endYear = req.query.end; // รับปีที่สิ้นสุดจาก query parameter

  // แปลงปีเป็นวันที่ที่สามารถใช้ใน SQL query
  // let startDate = `${startYear}-01-01`;
  // let endDate = `${endYear}-12-31`;

  let startDate = `2020-01-01`;
  let endDate = `2021-12-31`;

  let sql = `SELECT BURNT_SCAR_ID, AP_EN, PV_EN, FIRE_DATE, LATITUDE, LONGITUDE, REPLACE(REPLACE(GEOMETRY_DATA, '(', '['), ')', ']') AS GEOMETRY_DATA, GEOMETRY_TYPE FROM BURNT_SCAR_INFO WHERE FIRE_DATE BETWEEN '${startDate}' AND '${endDate}'`;

  db.query(sql, (err, results) => {
    if (err) throw err;

    // แปลงข้อมูลเป็นรูปแบบ GeoJSON
    let geojson = {
      type: "FeatureCollection",
      features: results.map(item => ({
        type: "Feature",
        properties: {
          BURNT_SCAR_ID: item.BURNT_SCAR_ID,
          AP_EN: item.AP_EN,
          PV_EN: item.PV_EN,
          FIRE_DATE: item.FIRE_DATE,
          LATITUDE: item.LATITUDE,
          LONGITUDE: item.LONGITUDE,
        },
        geometry: {
          type: item.GEOMETRY_TYPE,
          coordinates: JSON.parse(item.GEOMETRY_DATA)
        }
      }))
    };

    // ส่งข้อมูลกลับไปยัง client
    res.json(geojson);
  });
});



//read data from burnt folder
// server.get("/api/process-shapefiles-demo", async (req, res) => {
//     const { yearfrom, yearto, country, state } = req.query; // Extract the parameters from the request query
  
//     // You can now use these parameters in your function
//     // For example, you might want to use them to filter the data you're processing
  
//       const directoryPath = path.join(__dirname, "./output/burnt");
//       let filteredShpFile = 0; // keep total of filtered shapefile
//       fs.readdir(directoryPath, function (err, years) {
//       if (err) {
//           return console.log("Unable to scan directory: " + err);
//       }
//       let promises = years
//           .filter((year) => {
//           const yearInt = parseInt(year);
//           return yearInt >= yearfrom && yearInt <= yearto;
//           })
//           .map(function (year) {
//           const yearPath = path.join(directoryPath, year);
//           return fs.promises.readdir(yearPath).then((locations) => {
//               return locations.map(function (location) {
//               const locationPath = path.join(yearPath, location);
//               return fs.promises.readdir(locationPath).then((files) => {
//                   return files
//                   .reduce((promiseChain, file) => {
//                       if (path.extname(file) === ".shp") {
//                       return promiseChain.then(() =>
//                           shapefile.read(path.join(locationPath, file)).then((geojson) => {
//                           let filteredFeatures = geojson.features
//                               .filter((feature) => {
//                               //filter location by country and state
//                               const location = feature.properties.location;
//                               let countryCondition = true;
//                               let stateCondition = true;
//                               if (country) {
//                                   countryCondition = location.includes(country);
//                               }
//                               if (state) {
//                                   stateCondition = location.includes(state);
//                               }
//                               return countryCondition && stateCondition;
//                               })
//                               .map((feature) => {
//                               const latlong = feature.geometry.coordinates.join(",");
//                               console.log("latlong", latlong)
//                               return {
//                                   type: feature.type,
//                                   coordinates: latlong,
//                                   properties: { ...feature.properties, count: 1, year: [year] },
//                                   geometry: feature.geometry,
//                               };
//                               });
//                           return filteredFeatures;
//                           })
//                       );
//                       } else {
//                       return promiseChain;
//                       }
//                   }, Promise.resolve([]))
//                   .then((filteredFeaturesPerFile) => {
//                       if (filteredFeaturesPerFile.length > 0) {
//                           console.log("filteredFeaturesPerFile.length", filteredFeaturesPerFile.length)
//                           filteredShpFile++; // increment the count of filtered shapefiles
//                       }
//                       return filteredFeaturesPerFile;
//                   });
//               });
//               });
//           });
//       });
  
  
//       Promise.all(promises)
//         .then((dataArrays) => {
//           let data = [].concat(...dataArrays);
//           let finalData = [];
//           data = data.filter(item => item !== undefined);
//           data.forEach((item) => {
//             let found = finalData.find((d) => d.coordinates === item.coordinates);
//             if (!found) {
//               finalData.push(item);
//             } else {
//               found.properties.count++;
//               if (!found.properties.year.includes(item.properties.year[0])) {
//                 found.properties.year.push(item.properties.year[0]);
//               }
//             }
//           });
  
//           // Calculate the percentage of duplicates for each row
//           finalData.forEach((row) => {
//             // Use the formula (count / filteredShpFile) * 100 and round to two decimals
//             let percentage = ((row.properties.count / filteredShpFile) * 100).toFixed(2);
//             // Add the percentage to the properties as frequency
//             row.properties.frequency = percentage;
//             row.properties.total_shapefile = filteredShpFile;
//           });
  
//           res.json(finalData);
//         })
//         .catch((err) => {
//           console.log(err);
//           res.status(500).send("An error occurred while processing the shapefiles.");
//         });
//     });
//   });


server.get("/api/process-shapefiles-demo", async (req, res) => {
  const { yearfrom, yearto, country, state } = req.query; // Extract the parameters from the request query

  // You can now use these parameters in your function
  // For example, you might want to use them to filter the data you're processing

  const directoryPath = path.join(__dirname, "./output/Burn");
  let filteredShpFile = 0; // keep total of filtered shapefile
  fs.readdir(directoryPath, function (err, folders) {
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    let promises = folders.filter((folder) => {
        const year = parseInt(folder);
        return year >= yearfrom && year <= yearto;
    }).map(function (folder) {
        const folderPath = path.join(directoryPath, folder);
        return fs.promises.readdir(folderPath).then((files) => {
        return files
            .reduce((promiseChain, file) => {
            if (path.extname(file) === ".shp") {
                return promiseChain.then((accumulatedFeatures) =>
                shapefile.read(path.join(folderPath, file)).then((geojson) => {
                    let filteredFeatures = geojson.features
                    .filter((feature) => {
                        //filter location by country and state
                        const location = feature.properties.location;
                        let countryCondition = true;
                        let stateCondition = true;
                        if (country) {
                        countryCondition = location.includes(country);
                        }
                        if (state) {
                        stateCondition = location.includes(state);
                        }
                        return countryCondition && stateCondition;
                    })
                    .map((feature) => {
                        const latlong = feature.geometry.coordinates.join(",");
                        return {
                        type: feature.type,
                        coordinates: latlong,
                        properties: { ...feature.properties, count: 1, year: [folder] },
                        geometry: feature.geometry,
                        };
                    });
                    console.log("filteredFeatures", filteredFeatures.length)
                    // if(filteredFeatures.length > 0){
                    //     filteredShpFile++;
                    // }
                    return accumulatedFeatures.concat(filteredFeatures);
                })
                );
            } else {
                return promiseChain;
            }
            }, Promise.resolve([]))
            .then((filteredFeaturesPerFile) => {
                if (filteredFeaturesPerFile.length > 0) {
                    filteredShpFile++; // increment the count of filtered shapefiles
                }
                return filteredFeaturesPerFile;
            });
        });
    });
    Promise.all(promises)
      .then((dataArrays) => {
        let data = [].concat(...dataArrays);
        let finalData = [];
        data.forEach((item) => {
          let found = finalData.find((d) => d.coordinates === item.coordinates);
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
        finalData.forEach((row) => {
          // Use the formula (count / filteredShpFile) * 100 and round to two decimals
          let percentage = ((row.properties.count / filteredShpFile) * 100).toFixed(2);
          // Add the percentage to the properties as frequency
          row.properties.frequency = percentage;
          row.properties.total_shapefile = filteredShpFile;
        });
        console.log("filteredShpFile", filteredShpFile)
        res.json(finalData);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("An error occurred while processing the shapefiles.");
      });
  });
});

server.get("/api/get-burnt-scar-geojson", async (req, res) => {
  const { yearfrom, yearto, country, state, api_key } = req.query;
  let sql = "SELECT * FROM users WHERE api_key = ?";
  db.query(sql, [api_key], (err, results) => {
    if (err) {
      throw err;
    } else if (results.length === 0) {
      // If no user with the provided API key is found, send a 404 or 500 response
      res.status(404).send("Invalid API key");
    } else {
        const directoryPath = path.join(__dirname, "./output/Burn");
        let filteredShpFile = 0; // keep total of filtered shapefile
        fs.readdir(directoryPath, function (err, folders) {
          if (err) {
            return console.log("Unable to scan directory: " + err);
          }
        let promises = folders.filter((folder) => {
            const year = parseInt(folder);
            return year >= yearfrom && year <= yearto;
        }).map(function (folder) {
            const folderPath = path.join(directoryPath, folder);
            return fs.promises.readdir(folderPath).then((files) => {
            return files
                .reduce((promiseChain, file) => {
                if (path.extname(file) === ".shp") {
                    return promiseChain.then((accumulatedFeatures) =>
                    shapefile.read(path.join(folderPath, file)).then((geojson) => {
                        let filteredFeatures = geojson.features
                        .filter((feature) => {
                            //filter location by country and state
                            const location = feature.properties.location;
                            let countryCondition = true;
                            let stateCondition = true;
                            if (country) {
                            countryCondition = location.includes(country);
                            }
                            if (state) {
                            stateCondition = location.includes(state);
                            }
                            return countryCondition && stateCondition;
                        })
                        .map((feature) => {
                            const latlong = feature.geometry.coordinates.join(",");
                            return {
                            type: feature.type,
                            coordinates: latlong,
                            properties: { ...feature.properties, count: 1, year: [folder] },
                            geometry: feature.geometry,
                            };
                        });
                        console.log("filteredFeatures", filteredFeatures.length)
                        if(filteredFeatures.length > 0){
                            filteredShpFile++;
                        }
                        return accumulatedFeatures.concat(filteredFeatures);
                    })
                    );
                } else {
                    return promiseChain;
                }
                }, Promise.resolve([]))
            });
        });
        Promise.all(promises)
            .then((dataArrays) => {
                let data = [].concat(...dataArrays);
                let finalData = [];
                data.forEach((item) => {
                let found = finalData.find((d) => d.coordinates === item.coordinates);
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
                finalData.forEach((row) => {
                let percentage = ((row.properties.count / filteredShpFile) * 100).toFixed(2);
                row.properties.frequency = percentage;
                row.properties.total_shapefile = filteredShpFile;
                });
        
                res.json(finalData);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send("An error occurred while processing the shapefiles.");
            });
        });
    }
  });
});

server.get("/api/get-users", (req, res) => {
  const { email } = req.query;
  let sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

server.post("/api/login", (req, res) => {
  const { google_id, name, email, picture_url, api_key } = req.body;

  let sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Server error");
      return;
    }

    if (results.length > 0) {
      res.send("Logged in successfully");
    } else {
      sql = "INSERT INTO users (google_id, name, email, picture_url, api_key) VALUES (?, ?, ?, ?, ?)";

      db.query(sql, [google_id, name, email, picture_url, api_key], (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send("Server error");
        } else {
          res.send("User created successfully");
        }
      });
    }
  });
});

// Generate API Key
server.post("/api/generate", (req, res) => {
  const { email } = req.body;
  const apiKey = crypto.randomBytes(20).toString("hex");
  let sql = "SELECT api_key FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Server error");
      return;
    }

    if (results.length > 0 && results[0].api_key) {
      res.send("API key already exists");
    } else {
      sql = "UPDATE users SET api_key = ? WHERE email = ?";
      db.query(sql, [apiKey, email], (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send("Server error");
        } else {
          res.send("API key generated...");
        }
      });
    }
  });
});

server.get("/api/files", (req, res) => {
  const directoryPath = path.join(__dirname, "/output/burnt");
  let id = 1;
  let filesData = [];

  fs.readdirSync(directoryPath).forEach((year) => {
    const yearPath = path.join(directoryPath, year);
    if (fs.statSync(yearPath).isDirectory()) {
      fs.readdirSync(yearPath).forEach((location) => {
        const locationPath = path.join(yearPath, location);
        if (fs.statSync(locationPath).isDirectory()) {
          const stats = fs.statSync(locationPath);
          const acqireDate = stats.birthtime;
          const processDate = stats.mtime;
          filesData.push({
            id: id++,
            file_name: `${location}_${year}`,
            acqire_date: acqireDate,
            process_date: processDate,
            file_path: `/output/burnt/${year}/${location}`,
          });
        }
      });
    }
  });

  res.json(filesData);
});

server.post("/api/getZipFile", function (req, res) {
  const { filepath } = req.body;
  console.log(filepath);
  const directoryPath = path.join(__dirname, filepath);
  const archive = archiver("zip", {
    zlib: { level: 9 }, // Sets the compression level.
  });

  archive.on("error", function (err) {
    res.status(500).send({ error: err.message });
  });

  //on stream closed we can end the request
  res.on("close", function () {
    console.log("Archive wrote %d bytes", archive.pointer());
  });

  //set the archive name
  res.attachment("burnt.zip");

  //this is the streaming magic
  archive.pipe(res);
  archive.directory(directoryPath, false);
  archive.finalize();
});

server.listen(3000, function () {
  console.log("Server Listen at http://localhost:3000");
});
