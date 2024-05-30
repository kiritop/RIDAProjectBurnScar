import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

const BubbleChart = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // ข้อมูลที่คุณให้มา
    const data = [
      {
        COUNTRY_ISO3: 'THA',
        PV_EN: 'Chiang Mai',
        FIRE_YEAR: 2020,
        FIRE_MONTH: 1,
        SUM_AREA: 10471585.39,
      },
      {
        COUNTRY_ISO3: 'THA',
        PV_EN: 'Chiang Mai',
        FIRE_YEAR: 2021,
        FIRE_MONTH: 1,
        SUM_AREA: 158178.09,
      },
      {
        COUNTRY_ISO3: 'THA',
        PV_EN: 'Chiang Mai',
        FIRE_YEAR: 2022,
        FIRE_MONTH: 1,
        SUM_AREA: 8140.80,
      },
      {
        COUNTRY_ISO3: 'THA',
        PV_EN: 'Chiang Mai',
        FIRE_YEAR: 2024,
        FIRE_MONTH: 1,
        SUM_AREA: 1469936.26,
      },
    ];

    // แปลงข้อมูลเพื่อให้เหมาะสมกับ Bubble Chart
    const chartSeries = data.map((item) => ({
      name: item.FIRE_YEAR.toString(),
      data: [{ x: item.FIRE_YEAR, y: item.SUM_AREA }],
    }));

    setChartData(chartSeries);
  }, []);

  const chartOptions = {
    chart: {
      type: 'bubble',
    },
    xaxis: {
      title: {
        text: 'ปี',
      },
    },
    yaxis: {
      title: {
        text: 'SUM_AREA',
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