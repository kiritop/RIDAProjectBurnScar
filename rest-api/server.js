const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const mysql = require("mysql2/promise");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const port = process.env.PORT || 4000;

// Create connection pool to MySQL
const pool = mysql.createPool({
  host: "10.1.29.33",
  port: '3306',
  user: "root",
  password: "gdkll,@MFU2024",
  database: "RidaDB",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

  // host: process.env.DB_HOST || 'localhost',
  // port: process.env.DB_PORT || '3306',
  // user: process.env.DB_USER || 'root',
  // password: process.env.DB_PASSWORD || 'gdkll,@MFU2024',
  // database: process.env.DB_NAME || 'RidaDB'
  // host: "localhost",
  // user: "root",
  // password: "root1234",
  // database: "RidaDB",

// Middleware setup
let server = express();
server.use(bodyParser.json()); // ให้ server(express) ใช้งานการ parse json
server.use(morgan("dev")); // ให้ server(express) ใช้งานการ morgam module
server.use(cors()); // ให้ server(express) ใช้งานการ cors module

const executeQuery = async (query, params) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query(query, params);
    return results;
  } catch (error) {
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

server.get('/rida-api/api/line-chart', async (req, res) => {
  const { country, startDate, endDate, province } = req.query;

  let firstQuery = '';
  let firstQueryParams = [startDate, endDate];

  if (country === 'ALL' && province === 'ALL') {
    firstQuery = `SELECT ROUND(SUM(AREA), 2) AS SUM_AREA, COUNTRY, YEAR(FIRE_DATE) AS FIRE_YEAR FROM BURNT_SCAR_INFO WHERE FIRE_DATE BETWEEN ? AND ? GROUP BY COUNTRY, FIRE_YEAR;`;
  } else if (country !== 'ALL' && province === 'ALL') {
    firstQuery = `SELECT ROUND(SUM(AREA), 2) AS SUM_AREA, COUNTRY, YEAR(FIRE_DATE) AS FIRE_YEAR, PV_EN FROM BURNT_SCAR_INFO WHERE FIRE_DATE BETWEEN ? AND ? ${country ? 'AND ISO3 = ?' : ''} GROUP BY COUNTRY, FIRE_YEAR, PV_EN;`;
    if (country) firstQueryParams.push(country);
  } else if (country !== 'ALL' && province !== 'ALL') {
    firstQuery = `SELECT ROUND(SUM(AREA), 2) AS SUM_AREA, COUNTRY, YEAR(FIRE_DATE) AS FIRE_YEAR, AP_EN FROM BURNT_SCAR_INFO WHERE FIRE_DATE BETWEEN ? AND ? ${country ? 'AND ISO3 = ?' : ''} ${province ? 'AND PV_EN = ?' : ''} GROUP BY COUNTRY, FIRE_YEAR, AP_EN;`;
    if (country) firstQueryParams.push(country);
    if (province) firstQueryParams.push(province);
  }

  try {
    const firstResults = await executeQuery(firstQuery, firstQueryParams);

    const fireYear = firstResults.map(row => row.FIRE_YEAR);
    const uniqueFireYear = [...new Set(fireYear)];

    let secondQuery = '';
    let secondQueryParams = [uniqueFireYear];

    if (country === 'ALL' && province === 'ALL') {
      secondQuery = `SELECT ROUND(SUM(AREA), 2) AS SUM_AREA, COUNTRY, YEAR(FIRE_DATE) AS FIRE_YEAR, MONTH(FIRE_DATE) AS FIRE_MONTH FROM BURNT_SCAR_INFO WHERE YEAR(FIRE_DATE) IN (?) GROUP BY COUNTRY, FIRE_YEAR, FIRE_MONTH;`;
    } else if (country !== 'ALL' && province === 'ALL') {
      secondQuery = `SELECT ROUND(SUM(AREA), 2) AS SUM_AREA, COUNTRY, YEAR(FIRE_DATE) AS FIRE_YEAR, MONTH(FIRE_DATE) AS FIRE_MONTH, PV_EN FROM BURNT_SCAR_INFO WHERE YEAR(FIRE_DATE) IN (?) ${country ? 'AND ISO3 = ?' : ''} GROUP BY COUNTRY, FIRE_YEAR, FIRE_MONTH, PV_EN;`;
      if (country) secondQueryParams.push(country);
    } else if (country !== 'ALL' && province !== 'ALL') {
      secondQuery = `SELECT ROUND(SUM(AREA), 2) AS SUM_AREA, COUNTRY, YEAR(FIRE_DATE) AS FIRE_YEAR, MONTH(FIRE_DATE) AS FIRE_MONTH, AP_EN FROM BURNT_SCAR_INFO WHERE YEAR(FIRE_DATE) IN (?) ${country ? 'AND ISO3 = ?' : ''} ${province ? 'AND PV_EN = ?' : ''} GROUP BY COUNTRY, FIRE_YEAR, FIRE_MONTH, AP_EN;`;
      if (country) secondQueryParams.push(country);
      if (province) secondQueryParams.push(province);
    }

    const secondResults = await executeQuery(secondQuery, secondQueryParams);

    const transformedData = firstResults.map(row => {
      const { FIRE_YEAR, COUNTRY, PV_EN, AP_EN } = row;
      let details = [];
      if (country === 'ALL' && province === 'ALL') {
        details = secondResults.filter(secondRow => secondRow.FIRE_YEAR === FIRE_YEAR && secondRow.COUNTRY === COUNTRY);
      } else if (country !== 'ALL' && province === 'ALL') {
        details = secondResults.filter(secondRow => secondRow.FIRE_YEAR === FIRE_YEAR && secondRow.PV_EN === PV_EN);
      } else if (country !== 'ALL' && province !== 'ALL') {
        details = secondResults.filter(secondRow => secondRow.FIRE_YEAR === FIRE_YEAR && secondRow.AP_EN === AP_EN);
      }

      return {
        yearly: row,
        details
      };
    });

    res.json(transformedData);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get('/rida-api/api/bubble-chart', async (req, res) => {
  const { country, startDate, endDate, province } = req.query;

  let firstQuery = '';
  let firstQueryParams = [startDate, endDate];

  if (country === 'ALL' && province === 'ALL') {
    firstQuery = `SELECT ROUND(SUM(AREA), 2) AS SUM_AREA, COUNTRY, YEAR(FIRE_DATE) AS FIRE_YEAR FROM BURNT_SCAR_INFO WHERE FIRE_DATE BETWEEN ? AND ? GROUP BY COUNTRY, FIRE_YEAR;`;
  } else if (country !== 'ALL' && province === 'ALL') {
    firstQuery = `SELECT ROUND(SUM(AREA), 2) AS SUM_AREA, COUNTRY, YEAR(FIRE_DATE) AS FIRE_YEAR, PV_EN FROM BURNT_SCAR_INFO WHERE FIRE_DATE BETWEEN ? AND ? ${country ? 'AND ISO3 = ?' : ''} GROUP BY COUNTRY, FIRE_YEAR, PV_EN;`;
    if (country) firstQueryParams.push(country);
  } else if (country !== 'ALL' && province !== 'ALL') {
    firstQuery = `SELECT ROUND(SUM(AREA), 2) AS SUM_AREA, COUNTRY, YEAR(FIRE_DATE) AS FIRE_YEAR, AP_EN FROM BURNT_SCAR_INFO WHERE FIRE_DATE BETWEEN ? AND ? ${country ? 'AND ISO3 = ?' : ''} ${province ? 'AND PV_EN = ?' : ''} GROUP BY COUNTRY, FIRE_YEAR, AP_EN;`;
    if (country) firstQueryParams.push(country);
    if (province) firstQueryParams.push(province);
  }

  try {
    const firstResults = await executeQuery(firstQuery, firstQueryParams);

    const fireYear = firstResults.map(row => row.FIRE_YEAR);
    const uniqueFireYear = [...new Set(fireYear)];

    let secondQuery = '';
    let secondQueryParams = [uniqueFireYear];

    if (country === 'ALL' && province === 'ALL') {
      secondQuery = `SELECT ROUND(SUM(AREA), 2) AS SUM_AREA, COUNTRY, YEAR(FIRE_DATE) AS FIRE_YEAR, MONTH(FIRE_DATE) AS FIRE_MONTH FROM BURNT_SCAR_INFO WHERE YEAR(FIRE_DATE) IN (?) GROUP BY COUNTRY, FIRE_YEAR, FIRE_MONTH;`;
    } else if (country !== 'ALL' && province === 'ALL') {
      secondQuery = `SELECT ROUND(SUM(AREA), 2) AS SUM_AREA, COUNTRY, YEAR(FIRE_DATE) AS FIRE_YEAR, MONTH(FIRE_DATE) AS FIRE_MONTH, PV_EN FROM BURNT_SCAR_INFO WHERE YEAR(FIRE_DATE) IN (?) ${country ? 'AND ISO3 = ?' : ''} GROUP BY COUNTRY, FIRE_YEAR, FIRE_MONTH, PV_EN;`;
      if (country) secondQueryParams.push(country);
    } else if (country !== 'ALL' && province !== 'ALL') {
      secondQuery = `SELECT ROUND(SUM(AREA), 2) AS SUM_AREA, COUNTRY, YEAR(FIRE_DATE) AS FIRE_YEAR, MONTH(FIRE_DATE) AS FIRE_MONTH, AP_EN FROM BURNT_SCAR_INFO WHERE YEAR(FIRE_DATE) IN (?) ${country ? 'AND ISO3 = ?' : ''} ${province ? 'AND PV_EN = ?' : ''} GROUP BY COUNTRY, FIRE_YEAR, FIRE_MONTH, AP_EN;`;
      if (country) secondQueryParams.push(country);
      if (province) secondQueryParams.push(province);
    }

    const secondResults = await executeQuery(secondQuery, secondQueryParams);

    const transformedData = firstResults.map(row => {
      const { FIRE_YEAR, COUNTRY, PV_EN, AP_EN } = row;
      let details = [];
      if (country === 'ALL' && province === 'ALL') {
        details = secondResults.filter(secondRow => secondRow.FIRE_YEAR === FIRE_YEAR && secondRow.COUNTRY === COUNTRY);
      } else if (country !== 'ALL' && province === 'ALL') {
        details = secondResults.filter(secondRow => secondRow.FIRE_YEAR === FIRE_YEAR && secondRow.PV_EN === PV_EN);
      } else if (country !== 'ALL' && province !== 'ALL') {
        details = secondResults.filter(secondRow => secondRow.FIRE_YEAR === FIRE_YEAR && secondRow.AP_EN === AP_EN);
      }

      return {
        yearly: row,
        details
      };
    });

    res.json(transformedData);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get('/rida-api/api/burnt-bubble-chart', async (req, res) => {
  const { country, startDate, endDate, province } = req.query;

  let query = '';
  const queryParameters = [startDate, endDate];

  if (country && country !== 'ALL') {
    queryParameters.push(country);
  }
  if (province && province !== 'ALL') {
    queryParameters.push(province);
  }

  if (country === 'ALL' && province === 'ALL') {
    query = `
      SELECT 
          b.ISO3,
          ROUND(SUM(b.AREA), 3) AS TOTAL_AREA,
          l.LATITUDE,
          l.LONGITUDE
      FROM 
          BURNT_SCAR_INFO b
      JOIN 
          LOCATION_INFO l
      ON 
          b.ISO3 = l.ISO3
      WHERE 
          b.FIRE_DATE BETWEEN ? AND ?
          AND l.LOCATION_LEVEL = 'Admin'
      GROUP BY 
          b.ISO3, l.LATITUDE, l.LONGITUDE;
    `;
  } else if (country !== 'ALL' && province === 'ALL') {
    query = `
      SELECT 
          b.ISO3,
          b.PV_EN,
          ROUND(SUM(b.AREA), 3) AS TOTAL_AREA,
          l.LATITUDE,
          l.LONGITUDE
      FROM 
          BURNT_SCAR_INFO b
      JOIN 
          LOCATION_INFO l
      ON 
          b.PV_EN = l.PV_EN AND b.ISO3 = l.ISO3
      WHERE 
          b.FIRE_DATE BETWEEN ? AND ?
          AND b.ISO3 = ?
          AND l.LOCATION_LEVEL = 'Major'
      GROUP BY 
          b.ISO3, b.PV_EN, l.LATITUDE, l.LONGITUDE;
    `;
  } else if (country !== 'ALL' && province !== 'ALL') {
    query = `
      SELECT 
          b.ISO3,
          b.PV_EN,
          b.AP_EN,
          ROUND(SUM(b.AREA), 3) AS TOTAL_AREA,
          l.LATITUDE,
          l.LONGITUDE
      FROM 
          BURNT_SCAR_INFO b
      JOIN 
          LOCATION_INFO l
      ON 
          b.AP_EN = l.AP_EN AND b.PV_EN = l.PV_EN AND b.ISO3 = l.ISO3
      WHERE 
          b.FIRE_DATE BETWEEN ? AND ?
          AND b.ISO3 = ?
          AND b.PV_EN = ?
      GROUP BY 
          b.ISO3, b.PV_EN, b.AP_EN, l.LATITUDE, l.LONGITUDE;
    `;
  }

  try {
    const results = await executeQuery(query, queryParameters);
    res.json(results);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get('/rida-api/api/api-bubble-chart', async (req, res) => {
  const { country, startDate, endDate, province } = req.query;

  let query = '';
  const queryParameters = [startDate, endDate];

  if (country && country !== 'ALL') {
    queryParameters.push(country);
  }
  if (province && province !== 'ALL') {
    queryParameters.push(province);
  }

  if (country === 'ALL' && province === 'ALL') {
    query = `
      SELECT 
          b.ISO3,
          ROUND(SUM(b.AREA), 3) AS TOTAL_AREA,
          l.LATITUDE,
          l.LONGITUDE
      FROM 
          BURNT_SCAR_INFO b
      JOIN 
          LOCATION_INFO l
      ON 
          b.ISO3 = l.ISO3
      WHERE 
          b.FIRE_DATE BETWEEN ? AND ?
          AND l.LOCATION_LEVEL = 'Admin'
      GROUP BY 
          b.ISO3, l.LATITUDE, l.LONGITUDE;
    `;
  } else if (country !== 'ALL' && province === 'ALL') {
    query = `
      SELECT 
          b.ISO3,
          b.PV_EN,
          ROUND(SUM(b.AREA), 3) AS TOTAL_AREA,
          l.LATITUDE,
          l.LONGITUDE
      FROM 
          BURNT_SCAR_INFO b
      JOIN 
          LOCATION_INFO l
      ON 
          b.PV_EN = l.PV_EN AND b.ISO3 = l.ISO3
      WHERE 
          b.FIRE_DATE BETWEEN ? AND ?
          AND b.ISO3 = ?
          AND l.LOCATION_LEVEL = 'Major'
      GROUP BY 
          b.ISO3, b.PV_EN, l.LATITUDE, l.LONGITUDE;
    `;
  } else if (country !== 'ALL' && province !== 'ALL') {
    query = `
      SELECT 
          b.ISO3,
          b.PV_EN,
          b.AP_EN,
          ROUND(SUM(b.AREA), 3) AS TOTAL_AREA,
          l.LATITUDE,
          l.LONGITUDE
      FROM 
          BURNT_SCAR_INFO b
      JOIN 
          LOCATION_INFO l
      ON 
          b.AP_EN = l.AP_EN AND b.PV_EN = l.PV_EN AND b.ISO3 = l.ISO3
      WHERE 
          b.FIRE_DATE BETWEEN ? AND ?
          AND b.ISO3 = ?
          AND b.PV_EN = ?
      GROUP BY 
          b.ISO3, b.PV_EN, b.AP_EN, l.LATITUDE, l.LONGITUDE;
    `;
  }

  try {
    const results = await executeQuery(query, queryParameters);
    res.json(results);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get('/rida-api/api/hotspot-bubble-chart', async (req, res) => {
  const { country, startDate, endDate, province } = req.query;

  let query = '';
  const queryParameters = [startDate, endDate];

  if (country && country !== 'ALL') {
    queryParameters.push(country);
  }
  if (province && province !== 'ALL') {
    queryParameters.push(province);
  }

  if (country === 'ALL' && province === 'ALL') {
    query = `
      SELECT 
          b.ISO3,
          ROUND(SUM(b.AREA), 3) AS TOTAL_AREA,
          l.LATITUDE,
          l.LONGITUDE
      FROM 
          BURNT_SCAR_INFO b
      JOIN 
          LOCATION_INFO l
      ON 
          b.ISO3 = l.ISO3
      WHERE 
          b.FIRE_DATE BETWEEN ? AND ?
          AND l.LOCATION_LEVEL = 'Admin'
      GROUP BY 
          b.ISO3, l.LATITUDE, l.LONGITUDE;
    `;
  } else if (country !== 'ALL' && province === 'ALL') {
    query = `
      SELECT 
          b.ISO3,
          b.PV_EN,
          ROUND(SUM(b.AREA), 3) AS TOTAL_AREA,
          l.LATITUDE,
          l.LONGITUDE
      FROM 
          BURNT_SCAR_INFO b
      JOIN 
          LOCATION_INFO l
      ON 
          b.PV_EN = l.PV_EN AND b.ISO3 = l.ISO3
      WHERE 
          b.FIRE_DATE BETWEEN ? AND ?
          AND b.ISO3 = ?
          AND l.LOCATION_LEVEL = 'Major'
      GROUP BY 
          b.ISO3, b.PV_EN, l.LATITUDE, l.LONGITUDE;
    `;
  } else if (country !== 'ALL' && province !== 'ALL') {
    query = `
      SELECT 
          b.ISO3,
          b.PV_EN,
          b.AP_EN,
          ROUND(SUM(b.AREA), 3) AS TOTAL_AREA,
          l.LATITUDE,
          l.LONGITUDE
      FROM 
          BURNT_SCAR_INFO b
      JOIN 
          LOCATION_INFO l
      ON 
          b.AP_EN = l.AP_EN AND b.PV_EN = l.PV_EN AND b.ISO3 = l.ISO3
      WHERE 
          b.FIRE_DATE BETWEEN ? AND ?
          AND b.ISO3 = ?
          AND b.PV_EN = ?
      GROUP BY 
          b.ISO3, b.PV_EN, b.AP_EN, l.LATITUDE, l.LONGITUDE;
    `;
  }

  try {
    const results = await executeQuery(query, queryParameters);
    res.json(results);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});


server.get('/rida-api/api/line-chart-pm25', async (req, res) => {
  const { country, startDate, endDate, province } = req.query;

  let firstQuery = '';
  let firstQueryParams = [startDate, endDate];

  if (country === 'ALL' && province === 'ALL') {
    firstQuery = `SELECT ROUND(AVG(PM25), 2) AS AVG_PM25, COUNTRY, YEAR(AQI_DATE) AS AQI_YEAR FROM AIR_QUALITY WHERE AQI_DATE BETWEEN ? AND ? GROUP BY COUNTRY, AQI_YEAR;`;
  } else if (country !== 'ALL' && province === 'ALL') {
    firstQuery = `SELECT ROUND(AVG(PM25), 2) AS AVG_PM25, YEAR(AQI_DATE) AS AQI_YEAR, PV_EN FROM AIR_QUALITY WHERE AQI_DATE BETWEEN ? AND ? ${country ? 'AND ISO3 = ?' : ''} GROUP BY COUNTRY, AQI_YEAR, PV_EN;`;
    if (country) firstQueryParams.push(country);
  } else if (country !== 'ALL' && province !== 'ALL') {
    firstQuery = `SELECT ROUND(AVG(PM25), 2) AS AVG_PM25, YEAR(AQI_DATE) AS AQI_YEAR, AP_EN FROM AIR_QUALITY WHERE AQI_DATE BETWEEN ? AND ? ${country ? 'AND ISO3 = ?' : ''} ${province ? 'AND PV_EN = ?' : ''} GROUP BY COUNTRY, AQI_YEAR, AP_EN;`;
    if (country) firstQueryParams.push(country);
    if (province) firstQueryParams.push(province);
  }

  try {
    const firstResults = await executeQuery(firstQuery, firstQueryParams);

    const aqiYear = firstResults.map(row => row.AQI_YEAR);
    const uniqueAqiYear = [...new Set(aqiYear)];

    let secondQuery = '';
    let secondQueryParams = [uniqueAqiYear];

    if (country === 'ALL' && province === 'ALL') {
      secondQuery = `SELECT ROUND(AVG(PM25), 2) AS AVG_PM25, COUNTRY, YEAR(AQI_DATE) AS AQI_YEAR, MONTH(AQI_DATE) AS AQI_MONTH FROM AIR_QUALITY WHERE YEAR(AQI_DATE) IN (?) GROUP BY COUNTRY, AQI_YEAR, AQI_MONTH;`;
    } else if (country !== 'ALL' && province === 'ALL') {
      secondQuery = `SELECT ROUND(AVG(PM25), 2) AS AVG_PM25, COUNTRY, YEAR(AQI_DATE) AS AQI_YEAR, MONTH(AQI_DATE) AS AQI_MONTH, PV_EN FROM AIR_QUALITY WHERE YEAR(AQI_DATE) IN (?) ${country ? 'AND ISO3 = ?' : ''} GROUP BY COUNTRY, AQI_YEAR, AQI_MONTH, PV_EN;`;
      if (country) secondQueryParams.push(country);
    } else if (country !== 'ALL' && province !== 'ALL') {
      secondQuery = `SELECT ROUND(AVG(PM25), 2) AS AVG_PM25, COUNTRY, YEAR(AQI_DATE) AS AQI_YEAR, MONTH(AQI_DATE) AS AQI_MONTH, AP_EN FROM AIR_QUALITY WHERE YEAR(AQI_DATE) IN (?) ${country ? 'AND ISO3 = ?' : ''} ${province ? 'AND PV_EN = ?' : ''} GROUP BY COUNTRY, AQI_YEAR, AQI_MONTH, AP_EN;`;
      if (country) secondQueryParams.push(country);
      if (province) secondQueryParams.push(province);
    }

    const secondResults = await executeQuery(secondQuery, secondQueryParams);

    const transformedData = firstResults.map(row => {
      const { AQI_YEAR, COUNTRY, PV_EN, AP_EN } = row;
      let details = [];
      if (country === 'ALL' && province === 'ALL') {
        details = secondResults.filter(secondRow => secondRow.AQI_YEAR === AQI_YEAR && secondRow.COUNTRY === COUNTRY);
      } else if (country !== 'ALL' && province === 'ALL') {
        details = secondResults.filter(secondRow => secondRow.AQI_YEAR === AQI_YEAR && secondRow.PV_EN === PV_EN);
      } else if (country !== 'ALL' && province !== 'ALL') {
        details = secondResults.filter(secondRow => secondRow.AQI_YEAR === AQI_YEAR && secondRow.AP_EN === AP_EN);
      }

      return {
        yearly: row,
        details
      };
    });

    res.json(transformedData);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get('/rida-api/api/line-chart-hot-spot', async (req, res) => {
  const { country, startDate, endDate, province } = req.query;

  let firstQuery = '';
  let firstQueryParams = [startDate, endDate];

  if (country === 'ALL' && province === 'ALL') {
    firstQuery = `SELECT COUNT(*) AS SUM_HOTSPOT, COUNTRY, YEAR(HOT_SPOT_DATE) AS HOT_SPOT_YEAR FROM HOT_SPOT WHERE HOT_SPOT_DATE BETWEEN ? AND ? GROUP BY COUNTRY, HOT_SPOT_YEAR;`;
  } else if (country !== 'ALL' && province === 'ALL') {
    firstQuery = `SELECT COUNT(*) AS SUM_HOTSPOT, COUNTRY, YEAR(HOT_SPOT_DATE) AS HOT_SPOT_YEAR, PV_EN FROM HOT_SPOT WHERE HOT_SPOT_DATE BETWEEN ? AND ? ${country ? 'AND ISO3 = ?' : ''} GROUP BY COUNTRY, HOT_SPOT_YEAR, PV_EN;`;
    if (country) firstQueryParams.push(country);
  } else if (country !== 'ALL' && province !== 'ALL') {
    firstQuery = `SELECT COUNT(*) AS SUM_HOTSPOT, COUNTRY, YEAR(HOT_SPOT_DATE) AS HOT_SPOT_YEAR, AP_EN FROM HOT_SPOT WHERE HOT_SPOT_DATE BETWEEN ? AND ? ${country ? 'AND ISO3 = ?' : ''} ${province ? 'AND PV_EN = ?' : ''} GROUP BY COUNTRY, HOT_SPOT_YEAR, AP_EN;`;
    if (country) firstQueryParams.push(country);
    if (province) firstQueryParams.push(province);
  }

  try {
    const firstResults = await executeQuery(firstQuery, firstQueryParams);

    const hotspotYear = firstResults.map(row => row.HOT_SPOT_YEAR);
    const uniqueHotspotYear = [...new Set(hotspotYear)];

    let secondQuery = '';
    let secondQueryParams = [uniqueHotspotYear];

    if (country === 'ALL' && province === 'ALL') {
      secondQuery = `SELECT COUNT(*) AS SUM_HOTSPOT, COUNTRY, YEAR(HOT_SPOT_DATE) AS HOT_SPOT_YEAR, MONTH(HOT_SPOT_DATE) AS HOT_SPOT_MONTH FROM HOT_SPOT WHERE YEAR(HOT_SPOT_DATE) IN (?) GROUP BY COUNTRY, HOT_SPOT_YEAR, HOT_SPOT_MONTH;`;
    } else if (country !== 'ALL' && province === 'ALL') {
      secondQuery = `SELECT COUNT(*) AS SUM_HOTSPOT, COUNTRY, YEAR(HOT_SPOT_DATE) AS HOT_SPOT_YEAR, MONTH(HOT_SPOT_DATE) AS HOT_SPOT_MONTH, PV_EN FROM HOT_SPOT WHERE YEAR(HOT_SPOT_DATE) IN (?) ${country ? 'AND ISO3 = ?' : ''} GROUP BY COUNTRY, HOT_SPOT_YEAR, HOT_SPOT_MONTH, PV_EN;`;
      if (country) secondQueryParams.push(country);
    } else if (country !== 'ALL' && province !== 'ALL') {
      secondQuery = `SELECT COUNT(*) AS SUM_HOTSPOT, COUNTRY, YEAR(HOT_SPOT_DATE) AS HOT_SPOT_YEAR, MONTH(HOT_SPOT_DATE) AS HOT_SPOT_MONTH, AP_EN FROM HOT_SPOT WHERE YEAR(HOT_SPOT_DATE) IN (?) ${country ? 'AND ISO3 = ?' : ''} ${province ? 'AND PV_EN = ?' : ''} GROUP BY COUNTRY, HOT_SPOT_YEAR, HOT_SPOT_MONTH, AP_EN;`;
      if (country) secondQueryParams.push(country);
      if (province) secondQueryParams.push(province);
    }

    const secondResults = await executeQuery(secondQuery, secondQueryParams);

    const transformedData = firstResults.map(row => {
      const { HOT_SPOT_YEAR, COUNTRY, PV_EN, AP_EN } = row;
      let details = [];
      if (country === 'ALL' && province === 'ALL') {
        details = secondResults.filter(secondRow => secondRow.HOT_SPOT_YEAR === HOT_SPOT_YEAR && secondRow.COUNTRY === COUNTRY);
      } else if (country !== 'ALL' && province === 'ALL') {
        details = secondResults.filter(secondRow => secondRow.HOT_SPOT_YEAR === HOT_SPOT_YEAR && secondRow.PV_EN === PV_EN);
      } else if (country !== 'ALL' && province !== 'ALL') {
        details = secondResults.filter(secondRow => secondRow.HOT_SPOT_YEAR === HOT_SPOT_YEAR && secondRow.AP_EN === AP_EN);
      }

      return {
        yearly: row,
        details
      };
    });

    res.json(transformedData);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get("/rida-api/api/overview-table-hot-spot", async (req, res) => {
  const { fromDate, toDate, country, province } = req.query;

  let sql = '';

  if(country=='ALL'&&province =='ALL'){
    sql = `SELECT COUNT(*) AS COUNT_ROWS, COUNTRY as NAME_LIST, ISO3 
          FROM HOT_SPOT 
          WHERE HOT_SPOT_DATE BETWEEN ? AND ? 
          GROUP BY COUNTRY, ISO3 
          ORDER BY COUNT_ROWS DESC`;
  }else if (country!='ALL'&&province =='ALL'){
    sql = `SELECT COUNT(*) AS COUNT_ROWS, PV_EN as NAME_LIST, ISO3 
          FROM HOT_SPOT 
          WHERE HOT_SPOT_DATE BETWEEN ? AND ? AND ISO3 = ?
          GROUP BY PV_EN, ISO3 
          ORDER BY COUNT_ROWS DESC`;
  }else if (country!='ALL'&&province !='ALL'){
    sql = `SELECT COUNT(*) AS COUNT_ROWS, AP_EN as NAME_LIST, ISO3 
          FROM HOT_SPOT 
          WHERE HOT_SPOT_DATE BETWEEN ? AND ? AND ISO3 = ? AND PV_EN = ?
          GROUP BY AP_EN, ISO3 
          ORDER BY COUNT_ROWS DESC`;
  }

  const queryParams = [fromDate, toDate];
  if (country && country != 'ALL') queryParams.push(country);
  if (province && province != 'ALL') queryParams.push(province);

  try {
    const results = await executeQuery(sql, queryParams);
    res.send(results);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get("/rida-api/api/overview-table-pm25", async (req, res) => {
  const { fromDate, toDate, country, province } = req.query;

  let sql = '';

  if(country=='ALL'&&province =='ALL'){
    sql = `SELECT ROUND(AVG(PM25), 2) AS AVG_PM25, COUNTRY as NAME_LIST, ISO3 
          FROM AIR_QUALITY 
          WHERE AQI_DATE BETWEEN ? AND ? 
          GROUP BY COUNTRY, ISO3 
          ORDER BY AVG_PM25 DESC`;
  }else if (country!='ALL'&&province =='ALL'){
    sql = `SELECT ROUND(AVG(PM25), 2) AS AVG_PM25, PV_EN as NAME_LIST, ISO3 
          FROM AIR_QUALITY 
          WHERE AQI_DATE BETWEEN ? AND ? AND ISO3 = ?
          GROUP BY PV_EN, ISO3 
          ORDER BY AVG DESC`;
  }else if (country!='ALL'&&province !='ALL'){
    sql = `SELECT ROUND(AVG(PM25), 2) AS AVG_PM25, AP_EN as NAME_LIST, ISO3 
          FROM AIR_QUALITY 
          WHERE AQI_DATE BETWEEN ? AND ? AND ISO3 = ? AND PV_EN = ?
          GROUP BY AP_EN, ISO3 
          ORDER BY AVG_PM25 DESC`;
  }

  const queryParams = [fromDate, toDate];
  if (country && country != 'ALL') queryParams.push(country);
  if (province && province != 'ALL') queryParams.push(province);

  try {
    const results = await executeQuery(sql, queryParams);
    res.send(results);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get("/rida-api/api/overview-table", async (req, res) => {
  const { fromDate, toDate, country, province } = req.query;

  let sql = '';

  if(country=='ALL'&&province =='ALL'){
    sql = `SELECT ROUND(SUM(AREA),2) as SUM_AREA, COUNTRY as NAME_LIST, ISO3 FROM BURNT_SCAR_INFO WHERE FIRE_DATE BETWEEN ? AND ? GROUP BY COUNTRY, ISO3 ORDER BY SUM_AREA DESC `;
  }else if (country!='ALL'&&province =='ALL'){
    sql = `SELECT ROUND(SUM(AREA),2) as SUM_AREA, PV_EN as NAME_LIST, ISO3 FROM BURNT_SCAR_INFO WHERE FIRE_DATE BETWEEN ? AND ? AND ISO3 = ? GROUP BY PV_EN ORDER BY SUM_AREA DESC` ;
  }else if (country!='ALL'&&province !='ALL'){
    sql = `SELECT ROUND(SUM(AREA),2) as SUM_AREA, AP_EN as NAME_LIST, ISO3 FROM BURNT_SCAR_INFO WHERE FIRE_DATE BETWEEN ? AND ? AND ISO3 = ? AND PV_EN=? GROUP BY AP_EN ORDER BY SUM_AREA DESC` ;
  }

  const queryParams = [fromDate, toDate];
  if (country && country != 'ALL') queryParams.push(country);
  if (province && province != 'ALL') queryParams.push(province);
  try {
    const results = await executeQuery(sql, queryParams);
    res.send(results);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get("/rida-api/api/overview-chart", async (req, res) => {
  const { fromDate, toDate, country, province } = req.query;
  let sql = `SELECT ROUND(SUM(AREA),2) as SUM_AREA, COUNTRY, YEAR(FIRE_DATE) AS FIRE_YEAR, PV_EN, AP_EN FROM BURNT_SCAR_INFO WHERE FIRE_DATE BETWEEN ? AND ? `;

  if (country && country != 'ALL') {
    sql += ` AND ISO3 = ?`;
  }
  if (province && province != 'ALL') {
    sql += ` AND PV_EN = ?`;
  }
  sql += ` GROUP BY COUNTRY, FIRE_YEAR, PV_EN, AP_EN  `;

  const queryParams = [fromDate, toDate];
  if (country && country != 'ALL') queryParams.push(country);
  if (province && province != 'ALL') queryParams.push(province);

  try {
    const results = await executeQuery(sql, queryParams);
    res.send(results);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get("/rida-api/api/get-province", async (req, res) => {
  const { country, module } = req.query;
  let table = 'BURNT_SCAR_INFO b';
  if(module === "aqi"){
    table = 'AIR_QUALITY b';
  }else if(module === "hotspot"){
    table = 'HOT_SPOT b';
  }

  let sql = `SELECT DISTINCT 
  b.ISO3 AS ISO3, b.PV_EN AS PV_EN, l.LATITUDE AS LATITUDE, l.LONGITUDE AS LONGITUDE 
  FROM ${table} INNER JOIN LOCATION_INFO l ON b.PV_EN = l.PV_EN AND b.ISO3 = l.ISO3
  WHERE b.ISO3 = ? AND l.LOCATION_LEVEL = 'Major' 
  ORDER BY b.PV_EN`;

  try {
    const results = await executeQuery(sql, [country]);
    res.send(results);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get("/rida-api/api/get-max-freq", async (req, res) => {
  const { startDate, endDate, country, province } = req.query;
  let sql = `SELECT COALESCE(MAX(count), 1) AS max_count FROM ( SELECT COUNT(*) AS count FROM BURNT_SCAR_POINT WHERE FIRE_DATE BETWEEN ? AND ? `;
  
  if (country && country !== 'ALL') {
    sql += ` AND ISO3 = ?`;
  }
  
  if (province && province !== 'ALL') {
    sql += ` AND PV_EN = ?`;
  }
  
  sql += ` GROUP BY LATITUDE, LONGITUDE ) AS subquery;`;

  const queryParams = [startDate, endDate];
  if (country && country != 'ALL') queryParams.push(country);
  if (province && province != 'ALL') queryParams.push(province);

  try {
    const results = await executeQuery(sql, queryParams);
    res.send(results);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get('/rida-api/api/get-burnt-from-date', async (req, res) => {
  const { startDate, endDate, country, province } = req.query;

  let sql = `
    SELECT 
      BURNT_SCAR_ID, AP_EN, PV_EN, FIRE_DATE, AREA, COUNTRY, LATITUDE, LONGITUDE, 
      CONCAT('[', REPLACE(REPLACE(GEOMETRY_DATA, '(', '['), ')', ']'), ']') AS GEOMETRY_DATA, GEOMETRY_TYPE 
    FROM 
      BURNT_SCAR_INFO 
    WHERE 
      FIRE_DATE BETWEEN ? AND ?
  `;

  if (country && country !== 'ALL') {
    sql += ` AND ISO3 = ?`;
  }
  if (province && province !== 'ALL') {
    sql += ` AND PV_EN = ?`;
  }

  const queryParams = [startDate, endDate];
  if (country && country !== 'ALL') queryParams.push(country);
  if (province && province !== 'ALL') queryParams.push(province);

  try {
    const results = await executeQuery(sql, queryParams);

    let geojson = {
      type: "FeatureCollection",
      features: results.map(item => {
        let coordinates;
        try {
          // Validate and parse coordinates
          coordinates = JSON.parse(item.GEOMETRY_DATA);

          // Ensure coordinates are in the correct format for GeoJSON
          if (item.GEOMETRY_TYPE === 'Polygon') {
            // Example: Check if coordinates is an array of linear rings
            if (!Array.isArray(coordinates) || !Array.isArray(coordinates[0])) {
              throw new Error('Invalid Polygon coordinates format');
            }
          }

          // Add other geometry type validations if needed
        } catch (error) {
          console.error('Invalid geometry data:', item.GEOMETRY_DATA, 'Error:', error);
          coordinates = [];
        }

        return {
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
            coordinates: coordinates
          }
        };
      })
    };

    res.json(geojson);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get('/rida-api/api/get-burnt-scar-polygon', async (req, res) => {
  const { startDate, endDate, country, province, api_key } = req.query;

  let sql = "SELECT * FROM users WHERE api_key = ?";
  try {
    const userResults = await executeQuery(sql, [api_key]);
    if (userResults.length === 0) {
      res.status(404).send("Invalid API key");
      return;
    }

    sql = ` SELECT 
          BURNT_SCAR_ID, AP_EN, PV_EN, FIRE_DATE, AREA, COUNTRY, LATITUDE, LONGITUDE, 
          CONCAT('[', REPLACE(REPLACE(GEOMETRY_DATA, '(', '['), ')', ']'), ']') AS GEOMETRY_DATA, GEOMETRY_TYPE 
        FROM 
          BURNT_SCAR_INFO 
        WHERE 
          FIRE_DATE BETWEEN ? AND ?
      `;
    if (country && country!='ALL') {
      sql += ` AND ISO3 = ?`;
    }
    if (province && province!='ALL') {
      sql += ` AND PV_EN = ?`;
    }

    const queryParams = [startDate, endDate];
    if (country && country != 'ALL') queryParams.push(country);
    if (province && province != 'ALL') queryParams.push(province);

    const results = await executeQuery(sql, queryParams);

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

    res.json(geojson);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get("/rida-api/api/get-burnt-scar-point", async (req, res) => {
  const { startDate, endDate, country, province, api_key } = req.query;

  let sql = "SELECT * FROM users WHERE api_key = ?";
  try {
    const userResults = await executeQuery(sql, [api_key]);
    if (userResults.length === 0) {
      res.status(404).send("Invalid API key");
      return;
    }

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

    const results = await executeQuery(sqlQuery, queryParams);

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

    let maxCount = 0;
    reducedData.forEach(item => {
      if (item.count > maxCount) {
        maxCount = item.count;
      }
    });

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
          percent: percent
        },
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(item.LONGITUDE), parseFloat(item.LATITUDE)]
        }
      };
    });

    res.json(finalData);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get("/rida-api/api/get-burnt-point-from-date", async (req, res) => {
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

  try {
    const results = await executeQuery(sqlQuery, queryParams);

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

    let maxCount = 0;
    reducedData.forEach(item => {
      if (item.count > maxCount) {
        maxCount = item.count;
      }
    });

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
          percent: percent
        },
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(item.LONGITUDE), parseFloat(item.LATITUDE)]
        }
      };
    });

    res.json(finalData);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get("/rida-api/api/get-air-quality", async (req, res) => {
  const { date, country, province, api_key } = req.query;
  let sql = "SELECT * FROM users WHERE api_key = ?";
  try {
    const userResults = await executeQuery(sql, [api_key]);
    if (userResults.length === 0) {
      res.status(404).send("Invalid API key");
      return;
    }

    let sqlQuery = `SELECT * FROM AIR_QUALITY 
    WHERE AQI_DATE = ? `;

    const queryParams = [date];

    if (country) {
      sqlQuery += ` AND ISO3 LIKE ?`;
      queryParams.push(`%${country}%`);
    }

    if (province) {
      sqlQuery += ` AND pv_en LIKE ?`;
      queryParams.push(`%${province}%`);
    }

    const results = await executeQuery(sqlQuery, queryParams);
    res.send(results);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get("/rida-api/api/get-air-quality-from-date", async (req, res) => {
  const { date, country, province } = req.query;

  let sqlQuery = `SELECT * FROM AIR_QUALITY 
  WHERE AQI_DATE = ? `;

  const queryParams = [date];

  if (country) {
    sqlQuery += ` AND ISO3 LIKE ?`;
    queryParams.push(`%${country}%`);
  }

  if (province) {
    sqlQuery += ` AND pv_en LIKE ?`;
    queryParams.push(`%${province}%`);
  }

  try {
    const results = await executeQuery(sqlQuery, queryParams);
    res.send(results);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get("/rida-api/api/get-hotspot", async (req, res) => {
  const { date, country, province, api_key } = req.query;
  let sql = "SELECT * FROM users WHERE api_key = ?";
  try {
    const userResults = await executeQuery(sql, [api_key]);
    if (userResults.length === 0) {
      res.status(404).send("Invalid API key");
      return;
    }

    let sqlQuery = `SELECT * FROM HOT_SPOT 
    WHERE HOT_SPOT_DATE = ? `;

    const queryParams = [date];

    if (country) {
      sqlQuery += ` AND ISO3 LIKE ?`;
      queryParams.push(`%${country}%`);
    }

    if (province) {
      sqlQuery += ` AND pv_en LIKE ?`;
      queryParams.push(`%${province}%`);
    }

    const results = await executeQuery(sqlQuery, queryParams);
    res.send(results);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get("/rida-api/api/get-hotspot-from-date", async (req, res) => {
  const { date, country, province } = req.query;

  let sqlQuery = `SELECT * FROM HOT_SPOT 
  WHERE HOT_SPOT_DATE = ? `;

  const queryParams = [date];

  if (country) {
    sqlQuery += ` AND ISO3 LIKE ?`;
    queryParams.push(`%${country}%`);
  }

  if (province) {
    sqlQuery += ` AND pv_en LIKE ?`;
    queryParams.push(`%${province}%`);
  }

  try {
    const results = await executeQuery(sqlQuery, queryParams);
    res.send(results);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get('/rida-api/api/get-csv', async (req, res) => {
  const { startDate, endDate, country, province } = req.query;
  const { stringify } = require('csv-stringify');

  let sql = `SELECT DATE_FORMAT(FIRE_DATE, '%d-%m-%Y') as FIRE_DATE, AP_EN, PV_EN, COUNTRY, AREA, LATITUDE, LONGITUDE, REPLACE(REPLACE(GEOMETRY_DATA, '(', '['), ')', ']') AS GEOMETRY_DATA, GEOMETRY_TYPE FROM BURNT_SCAR_INFO WHERE FIRE_DATE BETWEEN ? AND ?`;

  if (country && country != 'ALL') {
    sql += ` AND ISO3 = ?`;
  }
  if (province && province != 'ALL') {
    sql += ` AND PV_EN = ?`;
  }

  const queryParams = [startDate, endDate];
  if (country && country != 'ALL') queryParams.push(country);
  if (province && province != 'ALL') queryParams.push(province);

  try {
    const results = await executeQuery(sql, queryParams);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="burnt_data.csv"');

    stringify(results, { header: true }, (err, output) => {
      if (err) {
        res.status(500).send('Error converting data to CSV');
      } else {
        res.send(output);
      }
    });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get('/rida-api/api/get-csv-hot-spot', async (req, res) => {
  const { startDate, endDate, country, province } = req.query;
  const { stringify } = require('csv-stringify');

  let sql = `SELECT DATE_FORMAT(HOT_SPOT_DATE, '%d-%m-%Y') as HOT_SPOT_DATE, AP_EN, PV_EN, COUNTRY, ISO3, LATITUDE, LONGITUDE FROM HOT_SPOT WHERE HOT_SPOT_DATE BETWEEN ? AND ?`;

  if (country && country != 'ALL') {
    sql += ` AND ISO3 = ?`;
  }
  if (province && province != 'ALL') {
    sql += ` AND PV_EN = ?`;
  }

  const queryParams = [startDate, endDate];
  if (country && country != 'ALL') queryParams.push(country);
  if (province && province != 'ALL') queryParams.push(province);

  try {
    const results = await executeQuery(sql, queryParams);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="hotspot_data.csv"');

    stringify(results, { header: true }, (err, output) => {
      if (err) {
        res.status(500).send('Error converting data to CSV');
      } else {
        res.send(output);
      }
    });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get('/rida-api/api/get-csv-pm25', async (req, res) => {
  const { startDate, endDate, country, province } = req.query;
  const { stringify } = require('csv-stringify');

  let sql = `SELECT DATE_FORMAT(AQI_DATE, '%d-%m-%Y') as AQI_DATE, AP_EN, PV_EN, COUNTRY, ISO3, LATITUDE, LONGITUDE, PM25 FROM AIR_QUALITY WHERE AQI_DATE BETWEEN ? AND ?`;

  if (country && country != 'ALL') {
    sql += ` AND ISO3 = ?`;
  }
  if (province && province != 'ALL') {
    sql += ` AND PV_EN = ?`;
  }

  const queryParams = [startDate, endDate];
  if (country && country != 'ALL') queryParams.push(country);
  if (province && province != 'ALL') queryParams.push(province);

  try {
    const results = await executeQuery(sql, queryParams);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="aqi_data.csv"');

    stringify(results, { header: true }, (err, output) => {
      if (err) {
        res.status(500).send('Error converting data to CSV');
      } else {
        res.send(output);
      }
    });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});

server.get("/rida-api/api/get-users", async (req, res) => {
  const { email } = req.query;
  let sql = "SELECT * FROM users WHERE email = ?";
  try {
    const results = await executeQuery(sql, [email]);
    res.send(results);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal server error');
  }
});


// Generate API key
server.post("/rida-api/api/generate", async (req, res) => {
  const { email } = req.body;
  const apiKey = crypto.randomBytes(20).toString("hex");
  let sql = "SELECT api_key FROM users WHERE email = ?";
  try {
    const results = await executeQuery(sql, [email]);
    if (results.length > 0 && results[0].api_key) {
      res.send("API key already exists");
    } else {
      sql = "UPDATE users SET api_key = ? WHERE email = ?";
      await executeQuery(sql, [apiKey, email]);
      res.send("API key generated...");
    }
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Server error");
  }
});


// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password'
  }
});

// Register new user
server.post("/rida-api/api/register", async (req, res) => {
  const { username, name, surname, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (username, name, surname, email, password) VALUES (?, ?, ?, ?, ?)";
    await executeQuery(sql, [username, name, surname, email, hashedPassword]);
    res.send("User registered successfully");
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Server error");
  }
});

// Login user
server.post("/rida-api/api/login", async (req, res) => {
  const { email, password } = req.body;

  let sql = "SELECT * FROM users WHERE email = ?";
  try {
    const results = await executeQuery(sql, [email]);
    if (results.length > 0) {
      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        res.json({
          message: "Logged in successfully",
          user: {
            id: user.id,
            name: user.name,
            surname: user.surname,
            email: user.email,
          },
        });
      } else {
        res.status(400).json({ message: "Invalid email or password" });
      }
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset password
server.post("/rida-api/api/reset-password", async (req, res) => {
  const { email } = req.body;
  const newPassword = crypto.randomBytes(8).toString("hex"); // Generate a random new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  let sql = "UPDATE users SET password = ? WHERE email = ?";
  try {
    await executeQuery(sql, [hashedPassword, email]);

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `Your new password is: ${newPassword}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).send("Error sending email");
      } else {
        res.send("Password reset successfully. Check your email for the new password.");
      }
    });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Server error");
  }
});

// Edit user details
server.put("/rida-api/api/edit-user", async (req, res) => {
  const { id, username, name, surname, email, password } = req.body;

  try {
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const sql = `UPDATE users SET
                 username = ?,
                 name = ?,
                 surname = ?,
                 email = ?${password ? ', password = ?' : ''}
                 WHERE id = ?`;

    const params = [username, name, surname, email];
    if (password) {
      params.push(hashedPassword);
    }
    params.push(id);

    await executeQuery(sql, params);
    res.send("User updated successfully");
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Server error");
  }
});

server.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});
