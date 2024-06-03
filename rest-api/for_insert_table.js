const express = require('express');
const csv = require('fast-csv');
const fs = require('fs');
const mysql = require('mysql2');

const app = express();

app.get('/', (req, res) => {
    const rows = [];
    fs.createReadStream('./data/Lao Burn Area Prediction 2024.csv')
        .pipe(csv.parse({ headers: true }))
        .on('data', (row) => {
            rows.push(row);
        })
        .on('end', () => {
            const connection = mysql.createConnection({
                host: "localhost",
                user: "root",
                password: "root1234",
                database: "RidaDB",
            });

            connection.connect((err) => {
                if (err) throw err;
                console.log('Connected to MySQL Server!');
            });

            rows.forEach((row) => {
                const sql = `INSERT INTO BURNT_SCAR_INFO (AP_EN, PV_EN, FIRE_DATE, LATITUDE, LONGITUDE, GEOMETRY_DATA, GEOMETRY_TYPE, COUNTRY, ISO3, AREA) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                const values = [row.AP_EN, row.PV_EN, row.FIRE_DATE, row.LATITUDE, row.LONGITUDE, row.GEOMETRY_DATA, row.GEOMETRY_TYPE, row.COUNTRY, row.ISO3, row.AREA];
                connection.query(sql, values, (err, result) => {
                    if (err) throw err;
                    console.log('Record inserted');
                });
            });

            console.log('inserted successfully');
            res.send('Data imported to MySQL successfully!');
        });
});

app.get('/point', (req, res) => {
    const rows = [];
    fs.createReadStream('./data/Thailand Burn Scar Point 2024.csv')
        .pipe(csv.parse({ headers: true }))
        .on('data', (row) => {
            rows.push(row);
        })
        .on('end', () => {
            const connection = mysql.createConnection({
                host: "localhost",
                user: "root",
                password: "root1234",
                database: "RidaDB",
            });

            connection.connect((err) => {
                if (err) throw err;
                console.log('Connected to MySQL Server!');
            });

            rows.forEach((row) => {
                const sql = `INSERT INTO BURNT_SCAR_POINT (AP_EN, PV_EN, FIRE_DATE, LATITUDE, LONGITUDE, COUNTRY, ISO3) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                const values = [row.AP_EN, row.PV_EN, row.FIRE_DATE, row.LATITUDE, row.LONGITUDE, row.COUNTRY, row.ISO3];
                connection.query(sql, values, (err, result) => {
                    if (err) throw err;
                    console.log('Record inserted');
                });
            });

            console.log('inserted successfully');
            res.send('Data imported to MySQL successfully!');
        });
});

app.listen(3000, () => {
    console.log('Server is running at port 3000');
});
