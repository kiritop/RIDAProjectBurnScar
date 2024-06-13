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
const stringify = require('csv-stringify');

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

server.get('/api/line-chart-pm25', (req, res) => {
  const country = req.query.country;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const province = req.query.province;

  let firstQuery ='';

  if(country=='ALL'&&province =='ALL'){
    firstQuery = `SELECT ROUND(MAX(PM25), 2) AS MAX_PM25, COUNTRY, YEAR(AQI_DATE) AS AQI_YEAR FROM AIR_QUALITY WHERE AQI_DATE BETWEEN ? AND ? GROUP BY COUNTRY, AQI_YEAR `;
  }else if (country!='ALL'&&province =='ALL'){
    firstQuery = `SELECT ROUND(MAX(PM25), 2) AS MAX_PM25, YEAR(AQI_DATE) AS AQI_YEAR, PV_EN FROM AIR_QUALITY WHERE AQI_DATE BETWEEN ? AND ?  ${country ? 'AND ISO3 = ?' : ''} GROUP BY  COUNTRY, AQI_YEAR, PV_EN; `;
  }else if (country!='ALL'&&province !='ALL'){
    firstQuery = `SELECT ROUND(MAX(PM25), 2) AS MAX_PM25, YEAR(AQI_DATE) AS AQI_YEAR, AP_EN FROM AIR_QUALITY WHERE AQI_DATE BETWEEN ? AND ?  ${country ? 'AND ISO3 = ?' : ''} ${province ? 'AND PV_EN = ?' : ''} GROUP BY  COUNTRY, AQI_YEAR, AP_EN; `;
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
      secondQuery = `SELECT ROUND(MAX(PM25), 2) AS MAX_PM25, COUNTRY, YEAR(AQI_DATE) AS AQI_YEAR, MONTH(AQI_DATE) AS AQI_MONTH FROM AIR_QUALITY WHERE YEAR(AQI_DATE) IN (?) GROUP BY COUNTRY, AQI_YEAR, AQI_MONTH; `;
    }else if (country!='ALL'&&province =='ALL'){
      secondQuery = `SELECT ROUND(MAX(PM25), 2) AS MAX_PM25, COUNTRY, YEAR(AQI_DATE) AS AQI_YEAR, MONTH(AQI_DATE) AS AQI_MONTH, PV_EN FROM AIR_QUALITY WHERE YEAR(AQI_DATE) IN (?)  ${country ? 'AND ISO3 = ?' : ''} GROUP BY  COUNTRY, AQI_YEAR, AQI_MONTH, PV_EN; `;
    }else if (country!='ALL'&&province !='ALL'){
      secondQuery = `SELECT ROUND(MAX(PM25), 2) AS MAX_PM25, COUNTRY, YEAR(AQI_DATE) AS AQI_YEAR, MONTH(AQI_DATE) AS AQI_MONTH, AP_EN FROM AIR_QUALITY WHERE YEAR(AQI_DATE) IN (?)  ${country ? 'AND ISO3 = ?' : ''} ${province ? 'AND PV_EN = ?' : ''} GROUP BY  COUNTRY, AQI_YEAR, AQI_MONTH, AP_EN; `;
    }


    const aqiYear = results.map((row) => row.AQI_YEAR);
    const uniqueAqiYear = aqiYear.filter((year, index) => {
      return aqiYear.indexOf(year) === index;
    });

    const secondQueryParameters = [uniqueAqiYear];
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
        const { AQI_YEAR, COUNTRY, PV_EN, AP_EN } = row;
        const yearly = row; // directly use the current row for summary
        let details = []
        if(country=='ALL'&&province =='ALL'){
          details = secondResults.filter((secondRow) => secondRow.AQI_YEAR === AQI_YEAR && secondRow.COUNTRY === COUNTRY);
        }else if(country!='ALL'&&province =='ALL'){
          details = secondResults.filter((secondRow) => secondRow.AQI_YEAR === AQI_YEAR && secondRow.PV_EN === PV_EN);
        }else if(country!='ALL'&&province !='ALL'){
          details = secondResults.filter((secondRow) => secondRow.AQI_YEAR === AQI_YEAR && secondRow.AP_EN === AP_EN);
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

server.get('/api/line-chart-hot-spot', (req, res) => {
  const country = req.query.country;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const province = req.query.province;

  let firstQuery ='';

  if(country=='ALL'&&province =='ALL'){
    firstQuery = `SELECT COUNT(*) AS SUM_HOTSPOT, COUNTRY, YEAR(HOT_SPOT_DATE) AS HOT_SPOT_YEAR FROM HOT_SPOT WHERE HOT_SPOT_DATE BETWEEN ? AND ? GROUP BY COUNTRY, HOT_SPOT_YEAR; `;
  }else if (country!='ALL'&&province =='ALL'){
    firstQuery = `SELECT COUNT(*) AS SUM_HOTSPOT, COUNTRY, YEAR(HOT_SPOT_DATE) AS HOT_SPOT_YEAR, PV_EN FROM HOT_SPOT WHERE HOT_SPOT_DATE BETWEEN ? AND ?  ${country ? 'AND ISO3 = ?' : ''} GROUP BY  COUNTRY, HOT_SPOT_YEAR, PV_EN; `;
  }else if (country!='ALL'&&province !='ALL'){
    firstQuery = `SELECT COUNT(*) AS SUM_HOTSPOT, COUNTRY, YEAR(HOT_SPOT_DATE) AS HOT_SPOT_YEAR, AP_EN FROM HOT_SPOT WHERE HOT_SPOT_DATE BETWEEN ? AND ?  ${country ? 'AND ISO3 = ?' : ''} ${province ? 'AND PV_EN = ?' : ''} GROUP BY  COUNTRY, HOT_SPOT_YEAR, AP_EN; `;
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
      secondQuery = `SELECT COUNT(*) AS SUM_HOTSPOT, COUNTRY, YEAR(HOT_SPOT_DATE) AS HOT_SPOT_YEAR, MONTH(HOT_SPOT_DATE) AS HOT_SPOT_MONTH FROM HOT_SPOT WHERE YEAR(HOT_SPOT_DATE) IN (?) GROUP BY COUNTRY, HOT_SPOT_YEAR, HOT_SPOT_MONTH; `;
    }else if (country!='ALL'&&province =='ALL'){
      secondQuery = `SELECT COUNT(*) AS SUM_HOTSPOT, COUNTRY, YEAR(HOT_SPOT_DATE) AS HOT_SPOT_YEAR, MONTH(HOT_SPOT_DATE) AS HOT_SPOT_MONTH, PV_EN FROM HOT_SPOT WHERE YEAR(HOT_SPOT_DATE) IN (?)  ${country ? 'AND ISO3 = ?' : ''} GROUP BY  COUNTRY, HOT_SPOT_YEAR, HOT_SPOT_MONTH, PV_EN; `;
    }else if (country!='ALL'&&province !='ALL'){
      secondQuery = `SELECT COUNT(*) AS SUM_HOTSPOT, COUNTRY, YEAR(HOT_SPOT_DATE) AS HOT_SPOT_YEAR, MONTH(HOT_SPOT_DATE) AS HOT_SPOT_MONTH, AP_EN FROM HOT_SPOT WHERE YEAR(HOT_SPOT_DATE) IN (?)  ${country ? 'AND ISO3 = ?' : ''} ${province ? 'AND PV_EN = ?' : ''} GROUP BY  COUNTRY, HOT_SPOT_YEAR, HOT_SPOT_MONTH, AP_EN; `;
    }


    const hotspotYear = results.map((row) => row.HOT_SPOT_YEAR);
    const uniqueHotspotYear = hotspotYear.filter((year, index) => {
      return hotspotYear.indexOf(year) === index;
    });

    const secondQueryParameters = [uniqueHotspotYear];
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
        const { HOT_SPOT_YEAR, COUNTRY, PV_EN, AP_EN } = row;
        const yearly = row; // directly use the current row for summary
        let details = []
        if(country=='ALL'&&province =='ALL'){
          details = secondResults.filter((secondRow) => secondRow.HOT_SPOT_YEAR === HOT_SPOT_YEAR && secondRow.COUNTRY === COUNTRY);
        }else if(country!='ALL'&&province =='ALL'){
          details = secondResults.filter((secondRow) => secondRow.HOT_SPOT_YEAR === HOT_SPOT_YEAR && secondRow.PV_EN === PV_EN);
        }else if(country!='ALL'&&province !='ALL'){
          details = secondResults.filter((secondRow) => secondRow.HOT_SPOT_YEAR === HOT_SPOT_YEAR && secondRow.AP_EN === AP_EN);
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

server.get("/api/overview-table-hot-spot", async (req, res) => {
  const { fromDate, toDate, country, province } = req.query;

  let sql = '';

  if(country=='ALL'&&province =='ALL'){
    sql = `SELECT COUNT(*) AS COUNT_ROWS, COUNTRY as NAME_LIST, ISO3 
          FROM RidaDB.HOT_SPOT 
          WHERE HOT_SPOT_DATE BETWEEN '${fromDate}' AND '${toDate}' 
          GROUP BY COUNTRY, ISO3 
          ORDER BY COUNT_ROWS DESC`;
  }else if (country!='ALL'&&province =='ALL'){
    sql = `SELECT COUNT(*) AS COUNT_ROWS, PV_EN as NAME_LIST, ISO3 
          FROM RidaDB.HOT_SPOT 
          WHERE ISO3 = '${country}' AND HOT_SPOT_DATE BETWEEN '${fromDate}' AND '${toDate}' 
          GROUP BY PV_EN, ISO3 
          ORDER BY COUNT_ROWS DESC`;
  }else if (country!='ALL'&&province !='ALL'){
    sql = `SELECT COUNT(*) AS COUNT_ROWS, AP_EN as NAME_LIST, ISO3 
          FROM RidaDB.HOT_SPOT 
          WHERE ISO3 = '${country}' AND PV_EN = '${province}' AND HOT_SPOT_DATE BETWEEN '${fromDate}' AND '${toDate}' 
          GROUP BY AP_EN, ISO3 
          ORDER BY COUNT_ROWS DESC`;
  }


  db.query(sql, [fromDate, toDate], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});


server.get("/api/overview-table-pm25", async (req, res) => {
  const { fromDate, toDate, country, province } = req.query;

  let sql = '';

  if(country=='ALL'&&province =='ALL'){
    sql = `SELECT ROUND(MAX(PM25), 2) AS MAX_PM25, COUNTRY as NAME_LIST, ISO3 
          FROM RidaDB.AIR_QUALITY 
          WHERE AQI_DATE BETWEEN '${fromDate}' AND '${toDate}' 
          GROUP BY COUNTRY, ISO3 
          ORDER BY MAX_PM25 DESC`;
  }else if (country!='ALL'&&province =='ALL'){
    sql = `SELECT ROUND(MAX(PM25), 2) AS MAX_PM25, PV_EN as NAME_LIST, ISO3 
          FROM RidaDB.AIR_QUALITY 
          WHERE ISO3 = '${country}' AND AQI_DATE BETWEEN '${fromDate}' AND '${toDate}' 
          GROUP BY PV_EN, ISO3 
          ORDER BY MAX_PM25 DESC`;
  }else if (country!='ALL'&&province !='ALL'){
    sql = `SELECT ROUND(MAX(PM25), 2) AS MAX_PM25, AP_EN as NAME_LIST, ISO3 
          FROM RidaDB.AIR_QUALITY 
          WHERE ISO3 = '${country}' AND PV_EN = '${province}' AND AQI_DATE BETWEEN '${fromDate}' AND '${toDate}' 
          GROUP BY AP_EN, ISO3 
          ORDER BY MAX_PM25 DESC`;
  }


  db.query(sql, [fromDate, toDate], (err, results) => {
    if (err) throw err;
    res.send(results);
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


server.get("/api/get-province", async (req, res) => {
  const { country, module } = req.query;
  let table = 'RidaDB.BURNT_SCAR_INFO' ;
  if(module === "aqi"){
    table = 'RidaDB.AIR_QUALITY'
  }else if(module === "hotspot"){
    table = 'RidaDB.HOT_SPOT'
  }
  let sql = `SELECT DISTINCT PV_EN FROM ${table} WHERE ISO3 = ? ORDER BY PV_EN`;
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

// SELECT
//     bsi.BURNT_SCAR_ID,
//     bsi.AP_EN,
//     bsi.PV_EN,
//     bsi.FIRE_DATE,
//     bsi.AREA,
//     bsi.COUNTRY,
//     bsi.LATITUDE,
//     bsi.LONGITUDE,
//     REPLACE(REPLACE(bsi.GEOMETRY_DATA, '(', '['), ')', ']') AS GEOMETRY_DATA,
//     bsi.GEOMETRY_TYPE,
//     subquery.max_count
// FROM
//     BURNT_SCAR_INFO bsi,
//     (
//         SELECT MAX(count) AS max_count
//         FROM (
//             SELECT COUNT(*) AS count
//             FROM burnt_scar_point
//             WHERE ISO3 = 'THA'
//               AND PV_EN = 'Chiang Mai'
//               AND FIRE_DATE BETWEEN '2020-01-01' AND '2024-12-31'
//             GROUP BY LATITUDE, LONGITUDE
//         ) AS count_subquery
//     ) AS subquery
// WHERE
//     bsi.FIRE_DATE BETWEEN '2020-01-01' AND '2024-12-31' and bsi.ISO3 = 'THA' AND bsi.PV_EN = 'Chiang Mai'; 

server.get("/api/get-max-freq", async (req, res) => {
  const { startDate, endDate, country, province } = req.query;
  let sql = `SELECT COALESCE(MAX(count), 1) AS max_count FROM ( SELECT COUNT(*) AS count FROM BURNT_SCAR_POINT WHERE FIRE_DATE BETWEEN '${startDate}' AND '${endDate}' `;
  
  if (country && country !== 'ALL') {
    sql += ` AND ISO3 = '${country}'`;
  }
  
  if (province && province !== 'ALL') {
    sql += ` AND PV_EN = '${province}'`;
  }
  
  sql += ` GROUP BY LATITUDE, LONGITUDE ) AS subquery;`;

  console.log('sql', sql);

  db.query(sql, [startDate, endDate], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).send('Database error');
      return;
    }

    // Assuming results will always contain a single row due to MAX aggregation
    const maxCount = results[0].max_count || 1; // Use 1 if max_count is null

    res.send({ max_count: maxCount });
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

//use api_key
server.get('/api/get-burnt-scar-polygon', (req, res) => {
  let startDate = req.query.startDate; // Get the start date from the query parameter
  let endDate = req.query.endDate; // Get the end date from the query parameter
  let country = req.query.country;
  let province = req.query.province;
  let api_key = req.query.api_key;

  let sql = "SELECT * FROM users WHERE api_key = ?";
  db.query(sql, [api_key], (err, results) => {
    if (err) {
      throw err;
    } else if (results.length === 0) {
      // If no user with the provided API key is found, send a 404 or 500 response
      res.status(404).send("Invalid API key");
    } else {

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
    }
  })
});



//use api_key
server.get("/api/get-burnt-scar-point", async (req, res) => {
  const { startDate, endDate, country, province, api_key } = req.query;

  let sql = "SELECT * FROM users WHERE api_key = ?";
  db.query(sql, [api_key], (err, results) => {
    if (err) {
      throw err;
    } else if (results.length === 0) {
      // If no user with the provided API key is found, send a 404 or 500 response
      res.status(404).send("Invalid API key");
    } else {

      let sqlQuery = `
        SELECT *, CONCAT(latitude, ',', longitude) AS coordinates, FIRE_DATE
        FROM BURNT_SCAR_POINT
        WHERE FIRE_DATE BETWEEN ? AND ?`;

      const queryParams = [startDate, endDate];

      if (country) {
        sqlQuery += ` AND ISO3 LIKE ?`;
        queryParams.push(`%${country}%`);
      }

      if (province) {
        sqlQuery += ` AND pv_en LIKE ?`;
        queryParams.push(`%${province}%`);
      }

      db.query(sqlQuery, queryParams, (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send("An error occurred while processing the data.");
          return;
        }

        // Use a Map to reduce data
        let reducedData = new Map();

        results.forEach(current => {
          let key = current.coordinates;
          if (!reducedData.has(key)) {
            reducedData.set(key, {
              ...current,
              count: 1,
              frequency_date: [current.FIRE_DATE]
            });
          } else {
            let existing = reducedData.get(key);
            existing.count++;
            existing.frequency_date.push(current.FIRE_DATE);
            reducedData.set(key, existing);
          }
        });

        // Find max count
        let maxCount = 0;
        reducedData.forEach(item => {
          if (item.count > maxCount) {
            maxCount = item.count;
          }
        });

        // Transform reduced data to final format
        let finalData = Array.from(reducedData.values()).map(item => {
          let percent = ((item.count / maxCount) * 100).toFixed(2);
          return {
            type: 'Feature',
            coordinates: item.coordinates,
            properties: {
              ...item,
              frequency: item.count,
              frequency_date: item.frequency_date.join(', '),
              max_count: maxCount,
              percent: percent // Add percent to properties
            },
            geometry: {
              type: 'Point',
              coordinates: [parseFloat(item.LONGITUDE), parseFloat(item.LATITUDE)]
            }
          };
        });

        res.json(finalData);
      });
    }
  })
});

server.get("/api/get-burnt-point-from-date", async (req, res) => {
  const { startDate, endDate, country, province } = req.query;

  let sqlQuery = `
    SELECT *, CONCAT(latitude, ',', longitude) AS coordinates, FIRE_DATE
    FROM BURNT_SCAR_POINT
    WHERE FIRE_DATE BETWEEN ? AND ?`;

  const queryParams = [startDate, endDate];

  if (country) {
    sqlQuery += ` AND ISO3 LIKE ?`;
    queryParams.push(`%${country}%`);
  }

  if (province) {
    sqlQuery += ` AND pv_en LIKE ?`;
    queryParams.push(`%${province}%`);
  }

  db.query(sqlQuery, queryParams, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred while processing the data.");
      return;
    }

    // Use a Map to reduce data
    let reducedData = new Map();

    results.forEach(current => {
      let key = current.coordinates;
      if (!reducedData.has(key)) {
        reducedData.set(key, {
          ...current,
          count: 1,
          frequency_date: [current.FIRE_DATE]
        });
      } else {
        let existing = reducedData.get(key);
        existing.count++;
        existing.frequency_date.push(current.FIRE_DATE);
        reducedData.set(key, existing);
      }
    });

    // Find max count
    let maxCount = 0;
    reducedData.forEach(item => {
      if (item.count > maxCount) {
        maxCount = item.count;
      }
    });

    // Transform reduced data to final format
    let finalData = Array.from(reducedData.values()).map(item => {
      let percent = ((item.count / maxCount) * 100).toFixed(2);
      return {
        type: 'Feature',
        coordinates: item.coordinates,
        properties: {
          ...item,
          frequency: item.count,
          frequency_date: item.frequency_date.join(', '),
          max_count: maxCount,
          percent: percent // Add percent to properties
        },
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(item.LONGITUDE), parseFloat(item.LATITUDE)]
        }
      };
    });

    res.json(finalData);
  });
});


server.get("/api/get-air-quality", async (req, res) => {
  const { startDate, endDate, country, province, api_key } = req.query;
  let sql = "SELECT * FROM users WHERE api_key = ?";
  db.query(sql, [api_key], (err, results) => {
    if (err) {
      throw err;
    } else if (results.length === 0) {
      // If no user with the provided API key is found, send a 404 or 500 response
      res.status(404).send("Invalid API key");
    } else {
      let sqlQuery = `SELECT * FROM RidaDB.AIR_QUALITY 
      WHERE AQI_DATE BETWEEN ? AND  ? `;

      const queryParams = [startDate, endDate];

      if (country) {
        sqlQuery += ` AND ISO3 LIKE ?`;
        queryParams.push(`%${country}%`);
      }

      if (province) {
        sqlQuery += ` AND pv_en LIKE ?`;
        queryParams.push(`%${province}%`);
      }

      db.query(sqlQuery, queryParams, (err, results) => {
        if (err) throw err;
        res.send(results);
      });
    }
  })
});

server.get("/api/get-air-quality-from-date", async (req, res) => {
  const { startDate, endDate, country, province } = req.query;

  let sqlQuery = `SELECT * FROM RidaDB.AIR_QUALITY 
  WHERE AQI_DATE BETWEEN ? AND  ? `;

  const queryParams = [startDate, endDate];

  if (country) {
    sqlQuery += ` AND ISO3 LIKE ?`;
    queryParams.push(`%${country}%`);
  }

  if (province) {
    sqlQuery += ` AND pv_en LIKE ?`;
    queryParams.push(`%${province}%`);
  }

  db.query(sqlQuery, queryParams, (err, results) => {
    if (err) throw err;
    res.send(results);
  });

});



server.get("/api/get-hotspot", async (req, res) => {
  const { startDate, endDate, country, province, api_key } = req.query;
  let sql = "SELECT * FROM users WHERE api_key = ?";
  db.query(sql, [api_key], (err, results) => {
    if (err) {
      throw err;
    } else if (results.length === 0) {
      // If no user with the provided API key is found, send a 404 or 500 response
      res.status(404).send("Invalid API key");
    } else {
      let sqlQuery = `SELECT * FROM RidaDB.HOT_SPOT 
      WHERE HOT_SPOT_DATE BETWEEN ? AND  ? `;

      const queryParams = [startDate, endDate];

      if (country) {
        sqlQuery += ` AND ISO3 LIKE ?`;
        queryParams.push(`%${country}%`);
      }

      if (province) {
        sqlQuery += ` AND pv_en LIKE ?`;
        queryParams.push(`%${province}%`);
      }

      db.query(sqlQuery, queryParams, (err, results) => {
        if (err) throw err;
        res.send(results);
      });
    }
  })
});

server.get("/api/get-hotspot-from-date", async (req, res) => {
  const { startDate, endDate, country, province } = req.query;

  let sqlQuery = `SELECT * FROM RidaDB.HOT_SPOT 
  WHERE HOT_SPOT_DATE BETWEEN ? AND  ? `;

  const queryParams = [startDate, endDate];

  if (country) {
    sqlQuery += ` AND ISO3 LIKE ?`;
    queryParams.push(`%${country}%`);
  }

  if (province) {
    sqlQuery += ` AND pv_en LIKE ?`;
    queryParams.push(`%${province}%`);
  }

  db.query(sqlQuery, queryParams, (err, results) => {
    if (err) throw err;
    res.send(results);
  });

});


server.get('/api/get-csv', (req, res) => {
  let startDate = req.query.startDate; // Get the start date from the query parameter
  let endDate = req.query.endDate; // Get the end date from the query parameter
  let country = req.query.country;
  let province = req.query.province;
  const { stringify } = require('csv-stringify');

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
    if (err) {
      res.status(500).send('Server error');
    } else {
      // กำหนด headers สำหรับ response เพื่อบอก browser ว่าจะ download ไฟล์
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=\"burnt_data.csv\"');

      // ใช้ csv-stringify เพื่อแปลงข้อมูลเป็น CSV
      stringify(results, { header: true }, (err, output) => {
        if (err) {
          res.status(500).send('Error converting data to CSV');
        } else {
          res.send(output);
        }
      });
    }
  });
});

server.get('/api/get-csv-hot-spot', (req, res) => {
  let startDate = req.query.startDate; // Get the start date from the query parameter
  let endDate = req.query.endDate; // Get the end date from the query parameter
  let country = req.query.country;
  let province = req.query.province;
  const { stringify } = require('csv-stringify');

  // Construct the SQL query
  let sql = `SELECT * FROM HOT_SPOT WHERE HOT_SPOT_DATE BETWEEN '${startDate}' AND '${endDate}'`;

  // Add conditions for country and province if they are provided
  if (country && country!='All') {
    sql += ` AND ISO3 = '${country}'`;
  }
  if (province && province!='All') {
    sql += ` AND PV_EN = '${province}'`;
  }

  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).send('Server error');
    } else {
      // กำหนด headers สำหรับ response เพื่อบอก browser ว่าจะ download ไฟล์
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=\"burnt_data.csv\"');

      // ใช้ csv-stringify เพื่อแปลงข้อมูลเป็น CSV
      stringify(results, { header: true }, (err, output) => {
        if (err) {
          res.status(500).send('Error converting data to CSV');
        } else {
          res.send(output);
        }
      });
    }
  });
});


server.get('/api/get-csv-pm25', (req, res) => {
  let startDate = req.query.startDate; // Get the start date from the query parameter
  let endDate = req.query.endDate; // Get the end date from the query parameter
  let country = req.query.country;
  let province = req.query.province;
  const { stringify } = require('csv-stringify');

  // Construct the SQL query
  let sql = `SELECT * FROM AIR_QUALITY WHERE AQI_DATE BETWEEN '${startDate}' AND '${endDate}'`;

  // Add conditions for country and province if they are provided
  if (country && country!='All') {
    sql += ` AND ISO3 = '${country}'`;
  }
  if (province && province!='All') {
    sql += ` AND PV_EN = '${province}'`;
  }

  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).send('Server error');
    } else {
      // กำหนด headers สำหรับ response เพื่อบอก browser ว่าจะ download ไฟล์
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=\"burnt_data.csv\"');

      // ใช้ csv-stringify เพื่อแปลงข้อมูลเป็น CSV
      stringify(results, { header: true }, (err, output) => {
        if (err) {
          res.status(500).send('Error converting data to CSV');
        } else {
          res.send(output);
        }
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



server.listen(3000, function () {
  console.log("Server Listen at http://localhost:3000");
});
