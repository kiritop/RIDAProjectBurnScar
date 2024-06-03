import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from "react-redux";

const BubbleChart = () => {
  const [chartData, setChartData] = useState([]);
  const dataBubble = useSelector((state) => state.dashboard.dataBubble ?? []);

  useEffect(() => {
   
    if(dataBubble){
      const chartSeries = dataBubble.map((item) => ({
        name: item.PV_EN + ', ' + item.FIRE_MONTH + '/' + item.FIRE_YEAR,
        data: [{ x: item.FIRE_YEAR + (item.FIRE_MONTH-1) / 12, y: item.SUM_AREA, z: item.SUM_AREA}],
      }));
      setChartData(chartSeries);
    }
    // แปลงข้อมูลเพื่อให้เหมาะสมกับ Bubble Chart
  }, [dataBubble]);

  // คำนวณ max และ min ใหม่
  const maxYear = Math.max(...chartData.map((series) => series.data[0].x)) + 1;
  const minYear = Math.min(...chartData.map((series) => series.data[0].x)) - 1;


  const chartOptions = {
    chart: {
      type: 'bubble',
      zoom: {
        enabled: false
      }
    },
    xaxis: {
      title: {
        text: 'YEAR', // เปลี่ยนชื่อแกนเป็น 'YEAR & MONTH'
      },
      max: maxYear,
      min: minYear,
    },
    yaxis: {
      title: {
        text: 'SUM OF AREA',
      },
      max: (max) => {
        // Calculate max value with a 1000 buffer
        const maxSeriesValue = Math.max(...chartData.map((series) => series.data[0].y));
        return maxSeriesValue + (maxSeriesValue * 0.5) ;
      },
      min: (min) => {
        // Calculate max value with a 1000 buffer
        const minSeriesValue = Math.min(...chartData.map((series) => series.data[0].y));
        return minSeriesValue - (minSeriesValue * 0.5) ;
      },
    },
    fill: {
      opacity: 0.8
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      // Customize tooltip content
      x: {
        formatter: function (val, opts) {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const year = Math.floor(val); // Calculate the year
          const monthIndex = Math.floor(( val * 12) % 12); // Calculate the month index
          const month = months[monthIndex]; // Get the corresponding month name
      
          return `${month} ${year}`; // Format as "MONTH/YEAR"
        },
      },
      y: {
        formatter: function (val) {
          return `${val.toFixed(2)} sq km`; // Format y-axis with 2 decimal places and unit
        },
      },
      z: {
        formatter: function (val) {
          return `${val.toFixed(2)} sq km`; // Format z-axis with 2 decimal places and label
        },
      },
    },
    
  };

  return (
    <div>
      <h1>Bubble Chart</h1>
      <ReactApexChart options={chartOptions} series={chartData} type="bubble" height={400} />
    </div>
  );
};

export default BubbleChart;