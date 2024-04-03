const cron = require('node-cron');
const axios = require('axios');
const mysql = require('mysql2');
const fs = require('fs');
const express = require('express');
const app = express();

// ตั้งค่าการเชื่อมต่อ MySQL
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root1234",
    database: "RidaDB",
});

// เชื่อมต่อกับฐานข้อมูล
connection.connect((err) => {
    if (err) throw err;
    console.log("Connected to the database.");
});

// อ่านข้อมูลจากไฟล์ data.json
const locations = JSON.parse(fs.readFileSync('./data/data.json', 'utf8'));

// ฟังก์ชันสำหรับเรียกข้อมูล PM2.5 และบันทึกค่าสูงสุดในแต่ละวัน
function fetchAndSaveMaxPM25() {
  const today = new Date().toISOString().slice(0, 10); // วันที่ปัจจุบันในรูปแบบ YYYY-MM-DD

  locations.forEach(location => {
    axios.get(`http://api.waqi.info/feed/geo:${location.lat};${location.lng}/?token=bc78d591c5a1ca3db96b08f0a9e249dce8a3085e`)
      .then(response => {
        const pm25 = response.data?.data?.iaqi?.pm25?.v;
        if (pm25 !== undefined) {
          // คิวรีเพื่อตรวจสอบว่ามีข้อมูลในวันนี้แล้วหรือยัง
          connection.query('SELECT * FROM air_quality WHERE date = ? AND latitude = ? AND longitude = ? ORDER BY pm25 DESC LIMIT 1', [today, location.lat, location.lng], (error, results) => {
            if (error) throw error;
            // ถ้ายังไม่มีข้อมูลหรือค่า PM2.5 ใหม่สูงกว่าในฐานข้อมูล ให้บันทึกข้อมูลใหม่
            if (results.length === 0 || pm25 > results[0]?.pm25) {
              const query = 'REPLACE INTO air_quality (date, latitude, longitude, pm25) VALUES (?, ?, ?, ?)';
              connection.query(query, [today, location.lat, location.lng, pm25], (error) => {
                if (error) throw error;
                console.log(`Max PM2.5 data saved for location ${location.name} on ${today}:`, pm25);
              });
            }
          });
        } else {
          console.log(`PM2.5 data is undefined for location ${location.name} on ${today}.`);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  });
}

// ตั้งเวลาเรียกฟังก์ชันทุก ๆ ครึ่งชั่วโมง
cron.schedule('*/30 * * * *', fetchAndSaveMaxPM25);

// เรียกใช้ฟังก์ชันทันทีเมื่อ server เริ่มต้น
fetchAndSaveMaxPM25();

// ตั้งเวลาให้ฟังก์ชันรันทุก ๆ 1 นาที
cron.schedule('* * * * *', fetchAndSaveMaxPM25);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
