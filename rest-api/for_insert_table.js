const express = require('express');
const readXlsxFile = require('read-excel-file/node');
const mysql = require('mysql2');

const app = express();

app.get('/', async (req, res) => {
    const rows = await readXlsxFile('./data/LC08_FEB2024_01_29.xlsx');
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

    rows.shift(); // ลบ row แรกที่เป็น header

    rows.forEach((row) => {
        const sql = `INSERT INTO burnscarfilter (TB_IDN, TB_TN, TB_EN, AP_IDN, AP_TN, AP_EN, PV_IDN, PV_TN, PV_EN, RE_ROYIN, LAT, LNG, FIRE_DATE) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [row[0], row[2], row[3], row[4], row[5], row[6], row[7], row[9], row[10], row[12], row[19], row[20], row[16]]; // เลือก column ที่จะใส่ใน field
        connection.query(sql, values, (err, result) => {
            if (err) throw err;
            console.log('Record inserted');
        });
    });
    
    console.log('inserted successfully');
    res.send('Data imported to MySQL successfully!');
});

app.listen(3000, () => {
    console.log('Server is running at port 3000');
});
