import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from "react-redux";

const LineChart = () => {

const [chartData, setChartData] = useState([]);
  const dataPoint = useSelector((state) => state.dashboard.dataPoint ?? []);
  useEffect(() => {
   
    if(dataPoint){
      setChartData(dataPoint);
    }
    // แปลงข้อมูลเพื่อให้เหมาะสมกับ Bubble Chart
  }, [dataPoint]);
  const options = {
    title: {
        text: 'Overview',
        align: 'left'
    },
    grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5
        },
    },
    chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
    xaxis: {
      categories: chartData.map(item => item['YEAR(FIRE_DATE)']),
    },
  };
  const series = [
    {
      name: 'Total Point',
      data: chartData.map(item => item.total_rows),
    },
  ];

  return (
    <div>
      <ReactApexChart options={options} series={series} type="line" height={300} />
    </div>
  );
};

export default LineChart;
