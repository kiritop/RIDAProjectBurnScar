const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const shapefile = require("shapefile");
const fs = require("fs");
const path = require("path");
const unzipper = require("unzipper");
const archiver = require("archiver");
const mysql = require("mysql");
const crypto = require("crypto");

// Create connection to MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root1234",
  database: "ridadb",
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

server.get("/read-shapefile", async (req, res) => {
  // Assuming the zipfile is in the same directory as your script
  // const zip = new AdmZip('./data/USA Fire Predicted GIS file-20240228T171559Z-001.zip');

  // Extract all files to /output directory
  // zip.extractAllTo('./output', /*overwrite*/true);

  // Assuming the shapefile is named 'shapefile.shp'
  // const shapefilePath = './output/USA Fire Predicted GIS file/USA_Fire_Predicted.shp';
  const shapefilePath = './output/N_Vi1_20240321/N_Vi1_20240321.shp';

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

server.get("/read-shapefile-half", async (req, res) => {
  const shapefilePath = "./output/2023/2023.shp";

  // First, count the total number of features
  let totalFeatures = 0;
  await shapefile.open(shapefilePath).then((source) =>
    source.read().then(function count(result) {
      if (result.done) return;
      totalFeatures++;
      return source.read().then(count);
    })
  );

  // Then, read only 10% of the features
  let features = [];
  let featureCount = 0;
  await shapefile.open(shapefilePath).then((source) =>
    source.read().then(function log(result) {
      if (result.done || featureCount >= totalFeatures / 20) return;
      features.push(result.value);
      featureCount++;
      return source.read().then(log);
    })
  );

  res.json(features);
});

server.get("/process-shapefiles", async (req, res) => {
  let data = [];
  const directoryPath = path.join(__dirname, "./output/demo");
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
      return console.log("Unable to scan directory: " + err);
    }
    let promises = [];
    files.forEach(function (file) {
      if (path.extname(file) === ".zip") {
        let promise = new Promise((resolve, reject) => {
          fs.createReadStream(directoryPath + "/" + file)
            .pipe(unzipper.Parse())
            .on("entry", function (entry) {
              const fileName = entry.path;
              const type = entry.type; // 'Directory' or 'File'
              if (type === "File" && fileName.includes("layers") && fileName.endsWith(".shp")) {
                shapefile
                  .read(entry)
                  .then((geojson) => {
                    geojson.features.forEach((feature) => {
                      const latlong = feature.geometry.coordinates.join(",");
                      const year = file.split("_")[1];
                      data.push({
                        type: feature.type,
                        coordinates: latlong,
                        properties: { ...feature.properties, count: 1, year: [year] },
                        geometry: feature.geometry,
                      });
                    });
                    resolve();
                    console.log("1");
                  })
                  .catch((err) => {
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
          // Use the formula (count / files.length) * 100 and round to two decimals
          let percentage = ((row.properties.count / files.length) * 100).toFixed(2);
          // Add the percentage to the properties as frequency
          row.properties.frequency = percentage;
          row.properties.total_shapefile = files.length;
        });
        console.log("files.length", files.length);

        res.json(finalData); // Send the data as JSON
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("An error occurred while processing the shapefiles.");
      });
  });
});


server.get('/process-shapefiles-demo', async (req, res) => {
    const { yearfrom, yearto, country, state } = req.query; // Extract the parameters from the request query

    // You can now use these parameters in your function
    // For example, you might want to use them to filter the data you're processing

    const directoryPath = path.join(__dirname, './output/Burn');
    let filteredShpFile = 0; // keep total of filtered shapefile
    fs.readdir(directoryPath, function (err, folders) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        let promises = folders
        .filter(folder => {
            const year = parseInt(folder);
            return year >= yearfrom && year <= yearto;
        })
        .map(function (folder) {
            const folderPath = path.join(directoryPath, folder);
            return fs.promises.readdir(folderPath)
                .then(files => {
                    return files.reduce((promiseChain, file) => {
                        if(path.extname(file) === '.shp'){
                            return promiseChain.then(() => shapefile.read(path.join(folderPath, file))
                                .then(geojson => {
                                    let filteredFeatures = geojson.features
                                        .filter(feature => {
                                            //filter location by country and state
                                            const location = feature.properties.properties;
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
                                        .map(feature => {
                                            const latlong = feature.geometry.coordinates.join(',');
                                            return { type: feature.type, coordinates: latlong, properties: { ...feature.properties, count: 1, year: [folder] }, geometry: feature.geometry};
                                        });
                                    return filteredFeatures;
                                }));
                        } else {
                            return promiseChain;
                        }
                    }, Promise.resolve([]))
                    .then(filteredFeaturesPerFile => {
                        if (filteredFeaturesPerFile.length > 0) {
                            filteredShpFile++; // increment the count of filtered shapefiles
                        }
                        return filteredFeaturesPerFile;
                    });
                });
        });
        Promise.all(promises)
            .then(dataArrays => {
                // console.log("dataArrays", dataArrays)
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
                    // Use the formula (count / filteredShpFile) * 100 and round to two decimals
                    let percentage = ((row.properties.count / filteredShpFile) * 100).toFixed(2);
                    // Add the percentage to the properties as frequency
                    row.properties.frequency = percentage;
                    row.properties.total_shapefile = filteredShpFile;
                });
                            
                res.json(finalData);
            })
            .catch(err => {
                console.log(err);
                res.status(500).send('An error occurred while processing the shapefiles.');
            });
    });
});

server.get("/get-users", (req, res) => {
  const { email } = req.query;
  let sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

server.post("/login", (req, res) => {
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

server.get("/files", (req, res) => {
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

server.post("/getZipFile", function (req, res) {
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
