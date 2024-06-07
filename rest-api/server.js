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
  // host: "localhost",
  // user: "root",
  // password: "root1234",
  // database: "RidaDB",
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


// SELECT ROUND(SUM(AREA),2) as SUM_AREA, COUNTRY, YEAR(FIRE_DATE) AS FIRE_YEAR FROM RidaDB.BURNT_SCAR_INFO WHERE ISO3 = 'THA' AND FIRE_DATE BETWEEN '2020-01-01' AND '2024-01-01' GROUP BY COUNTRY, FIRE_YEAR;
// SELECT ROUND(SUM(AREA),2) as SUM_AREA, COUNTRY, YEAR(FIRE_DATE) AS FIRE_YEAR, MONTH(FIRE_DATE) AS FIRE_MONTH, PV_EN, AP_EN FROM RidaDB.BURNT_SCAR_INFO WHERE YEAR(FIRE_DATE) = '2020' AND ISO3 = 'THA' AND PV_EN = 'Chiang Mai' GROUP BY COUNTRY, FIRE_YEAR, FIRE_MONTH, PV_EN, AP_EN;
// SELECT ROUND(SUM(AREA),2) as SUM_AREA, COUNTRY FROM RidaDB.BURNT_SCAR_INFO WHERE FIRE_DATE BETWEEN '2020-01-01' AND '2024-01-01' GROUP BY COUNTRY;
// SELECT ROUND(SUM(AREA),2) as SUM_AREA, PV_EN FROM RidaDB.BURNT_SCAR_INFO WHERE FIRE_DATE BETWEEN '2020-01-01' AND '2024-01-01' AND ISO3 = 'THA' GROUP BY PV_EN;
// SELECT ROUND(SUM(AREA),2) as SUM_AREA, AP_EN FROM RidaDB.BURNT_SCAR_INFO WHERE FIRE_DATE BETWEEN '2020-01-01' AND '2024-01-01' AND PV_EN = 'Chiang Mai' GROUP BY AP_EN;




server.get('/api/line-chart', (req, res) => {
  const country = req.query.country;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const province = req.query.province;

  let firstQuery ='';

  if(country=='ALL'&&province =='ALL'){
    firstQuery = `SELECT ROUND(SUM(AREA), 2) AS SUM_AREA, COUNTRY, YEAR(FIRE_DATE) AS FIRE_YEAR FROM BURNT_SCAR_INFO WHERE FIRE_DATE BETWEEN ? AND ? GROUP BY COUNTRY, FIRE_YEAR; `;
  }else if (country!='ALL'&&province =='ALL'){
    firstQuery = `SELECT ROUND(SUM(AREA), 2) AS SUM_AREA, COUNTRY, YEAR(FIRE_DATE) AS FIRE_YEAR, PV_EN FROM BURNT_SCAR_INFO WHERE FIRE_DATE BETWEEN ? AND ?  ${country ? 'AND ISO3 = ?' : ''} GROUP BY  COUNTRY, FIRE_YEAR, PV_EN; `;
  }else if (country!='ALL'&&province !='ALL'){
    firstQuery = `SELECT ROUND(SUM(AREA), 2) AS SUM_AREA, COUNTRY, YEAR(FIRE_DATE) AS FIRE_YEAR, AP_EN FROM BURNT_SCAR_INFO WHERE FIRE_DATE BETWEEN ? AND ?  ${country ? 'AND ISO3 = ?' : ''} ${province ? 'AND PV_EN = ?' : ''} GROUP BY  COUNTRY, FIRE_YEAR, AP_EN; `;
  }

  const queryParameters = [startDate, endDate];
  if (country && country!='ALL') {
    queryParameters.push(country);
  }
  if (province && province!='ALL') {
    queryParameters.push(province);
  }

  db.query(firstQuery, queryParameters, (error, results) => {
    if (error) {
      console.error('Error executing first query:', error);
      res.status(500).send('Internal server error');
      return;
    }

    let secondQuery ='';

    if(country=='ALL'&&province =='ALL'){
      secondQuery = `SELECT ROUND(SUM(AREA), 2) AS SUM_AREA, COUNTRY, YEAR(FIRE_DATE) AS FIRE_YEAR, MONTH(FIRE_DATE) AS FIRE_MONTH FROM BURNT_SCAR_INFO WHERE YEAR(FIRE_DATE) IN (?) GROUP BY COUNTRY, FIRE_YEAR, FIRE_MONTH; `;
    }else if (country!='ALL'&&province =='ALL'){
      secondQuery = `SELECT ROUND(SUM(AREA), 2) AS SUM_AREA, COUNTRY, YEAR(FIRE_DATE) AS FIRE_YEAR, MONTH(FIRE_DATE) AS FIRE_MONTH, PV_EN FROM BURNT_SCAR_INFO WHERE YEAR(FIRE_DATE) IN (?)  ${country ? 'AND ISO3 = ?' : ''} GROUP BY  COUNTRY, FIRE_YEAR, FIRE_MONTH, PV_EN; `;
    }else if (country!='ALL'&&province !='ALL'){
      secondQuery = `SELECT ROUND(SUM(AREA), 2) AS SUM_AREA, COUNTRY, YEAR(FIRE_DATE) AS FIRE_YEAR, MONTH(FIRE_DATE) AS FIRE_MONTH, AP_EN FROM BURNT_SCAR_INFO WHERE YEAR(FIRE_DATE) IN (?)  ${country ? 'AND ISO3 = ?' : ''} ${province ? 'AND PV_EN = ?' : ''} GROUP BY  COUNTRY, FIRE_YEAR, FIRE_MONTH, AP_EN; `;
    }


    const fireYear = results.map((row) => row.FIRE_YEAR);
    const uniqueFireYear = fireYear.filter((year, index) => {
      return fireYear.indexOf(year) === index;
    });

    const secondQueryParameters = [uniqueFireYear];
    if (country && country!='ALL') {
      secondQueryParameters.push(country);
    }
    if (province && province!='ALL') {
      secondQueryParameters.push(province);
    }



    db.query(secondQuery, secondQueryParameters, (error, secondResults) => {
      if (error) {
        console.error('Error executing second query:', error);
        res.status(500).send('Internal server error');
        return;
      }


      const transformedData = [];

      results.forEach((row) => {
        const { FIRE_YEAR, COUNTRY, PV_EN, AP_EN } = row;
        const yearly = row; // directly use the current row for summary
        let details = []
        if(country=='ALL'&&province =='ALL'){
          details = secondResults.filter((secondRow) => secondRow.FIRE_YEAR === FIRE_YEAR && secondRow.COUNTRY === COUNTRY);
        }else if(country!='ALL'&&province =='ALL'){
          details = secondResults.filter((secondRow) => secondRow.FIRE_YEAR === FIRE_YEAR && secondRow.PV_EN === PV_EN);
        }else if(country!='ALL'&&province !='ALL'){
          details = secondResults.filter((secondRow) => secondRow.FIRE_YEAR === FIRE_YEAR && secondRow.AP_EN === AP_EN);
        }

        const transformedYearData = {
          yearly,
          details
        };
        transformedData.push(transformedYearData)
        

      });

      res.json(transformedData);
    });
  });
});

server.get("/api/overview-table", async (req, res) => {
  const { fromDate, toDate, country, province } = req.query;

  let sql = '';

  if(country=='ALL'&&province =='ALL'){
    sql = `SELECT ROUND(SUM(AREA),2) as SUM_AREA, COUNTRY as NAME_LIST, ISO3 FROM RidaDB.BURNT_SCAR_INFO WHERE FIRE_DATE BETWEEN '${fromDate}' AND '${toDate}' GROUP BY COUNTRY, ISO3 ORDER BY SUM_AREA DESC `;
  }else if (country!='ALL'&&province =='ALL'){
    sql = `SELECT ROUND(SUM(AREA),2) as SUM_AREA, PV_EN as NAME_LIST, ISO3 FROM RidaDB.BURNT_SCAR_INFO WHERE ISO3 = '${country}' AND FIRE_DATE BETWEEN '${fromDate}' AND '${toDate}' GROUP BY PV_EN ORDER BY SUM_AREA DESC` ;
  }else if (country!='ALL'&&province !='ALL'){
    sql = `SELECT ROUND(SUM(AREA),2) as SUM_AREA, AP_EN as NAME_LIST, ISO3 FROM RidaDB.BURNT_SCAR_INFO WHERE ISO3 = '${country}' AND PV_EN='${province}' AND FIRE_DATE BETWEEN '${fromDate}' AND '${toDate}' GROUP BY AP_EN ORDER BY SUM_AREA DESC` ;
  }


  db.query(sql, [fromDate, toDate], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});





server.get("/api/overview-chart", async (req, res) => {
  const { fromDate, toDate, country, province } = req.query;
  let sql = `SELECT ROUND(SUM(AREA),2) as SUM_AREA, COUNTRY, YEAR(FIRE_DATE) AS FIRE_YEAR, PV_EN, AP_EN FROM RidaDB.BURNT_SCAR_INFO WHERE FIRE_DATE BETWEEN '${fromDate}' AND '${toDate}' `;

  if (country && country!='ALL') {
    sql += ` AND ISO3 = '${country}'`;
  }
  if (province && province!='ALL') {
    sql += ` AND PV_EN = '${province}'`;
  }
  sql += ` GROUP BY COUNTRY, FIRE_YEAR, PV_EN, AP_EN  `;

  db.query(sql, [fromDate, toDate], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});



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

server.get("/api/get-province", async (req, res) => {
  const { country } = req.query;
  let sql = `SELECT DISTINCT PV_EN FROM RidaDB.BURNT_SCAR_INFO WHERE ISO3 = ?`;
  db.query(sql, [country], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});


server.get("/api/get-data-for-bubble", async (req, res) => {
  const { fromDate, toDate, country, province } = req.query;
  let sql = `SELECT ISO3 AS COUNTRY_ISO3, PV_EN, YEAR(FIRE_DATE) AS FIRE_YEAR, MONTH(FIRE_DATE) AS FIRE_MONTH, SUM(AREA) as SUM_AREA FROM RidaDB.BURNT_SCAR_INFO WHERE FIRE_DATE BETWEEN '${fromDate}' AND '${toDate}'`;

  if (country && country!='ALL') {
    sql += ` AND ISO3 = '${country}'`;
  }
  if (province && province!='ALL') {
    sql += ` AND PV_EN = '${province}'`;
  }

  sql += ` GROUP BY COUNTRY, ISO3, FIRE_YEAR, FIRE_MONTH, PV_EN `;
  db.query(sql, [fromDate, toDate], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});


server.get("/api/get-data-for-point", async (req, res) => {
  const { fromDate, toDate, country, province } = req.query;
  let sql = `SELECT ISO3 AS COUNTRY_ISO3, PV_EN, COUNTRY, COUNT(*) AS total_rows,  MONTH(FIRE_DATE),  YEAR(FIRE_DATE) FROM RidaDB.burnt_scar_point WHERE FIRE_DATE BETWEEN '${fromDate}' AND '${toDate}'`;

  if (country && country!='ALL') {
    sql += ` AND ISO3 = '${country}'`;
  }
  if (province && province!='ALL') {
    sql += ` AND PV_EN = '${province}'`;
  }
  sql += ` GROUP BY COUNTRY_ISO3, PV_EN, COUNTRY, MONTH(FIRE_DATE),  YEAR(FIRE_DATE) `;
  db.query(sql, [fromDate, toDate], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});


// สร้าง endpoint สำหรับ query ข้อมูลตามช่วงวันที่
server.get('/api/get-burnt-from-date', (req, res) => {
  let startDate = req.query.startDate; // Get the start date from the query parameter
  let endDate = req.query.endDate; // Get the end date from the query parameter
  let country = req.query.country;
  let province = req.query.province;

  // Construct the SQL query
  let sql = `SELECT BURNT_SCAR_ID, AP_EN, PV_EN, FIRE_DATE, AREA, COUNTRY, LATITUDE, LONGITUDE, REPLACE(REPLACE(GEOMETRY_DATA, '(', '['), ')', ']') AS GEOMETRY_DATA, GEOMETRY_TYPE FROM BURNT_SCAR_INFO WHERE FIRE_DATE BETWEEN '${startDate}' AND '${endDate}'`;

  // Add conditions for country and province if they are provided
  if (country && country!='All') {
    sql += ` AND ISO3 = '${country}'`;
  }
  if (province && province!='All') {
    sql += ` AND PV_EN = '${province}'`;
  }
  db.query(sql, (err, results) => {
    if (err) throw err;

    // Convert data to GeoJSON format
    let geojson = {
      type: "FeatureCollection",
      features: results.map(item => ({
        type: "Feature",
        properties: {
          BURNT_SCAR_ID: item.BURNT_SCAR_ID,
          AP_EN: item.AP_EN,
          PV_EN: item.PV_EN,
          COUNTRY: item.COUNTRY,
          AREA: item.AREA,
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

    // Send the data back to the client
    res.json(geojson);
  });
});



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
  const { username, first_name, last_name, email, picture_url, api_key } = req.body;

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
      sql = "INSERT INTO users (username, first_name, last_name, email, picture_url, api_key) VALUES (?, ?, ?, ?, ?)";

      db.query(sql, [username, first_name, last_name, email, picture_url, api_key], (err, results) => {
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
