import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from "react-redux";

const LineChart = () => {

  const dataFromRedux = useSelector((state) => state.dashboard.dataBurntChart ?? []);
  const [seriesData, setSeriesData] = useState([]);

  useEffect(() => {
    const processData = () => {
      const groupedData = dataFromRedux.reduce((acc, data) => {
        const { COUNTRY, FIRE_YEAR, PV_EN, AP_EN } = data.yearly;
        let countryData
        if(data.yearly.PV_EN){
          console.log('1')
          countryData = acc[PV_EN] || [];
        }else if(data.yearly.AP_EN){
          countryData = acc[AP_EN] || [];
        }else{
          countryData = acc[COUNTRY] || [];
        }

        // Create a map of existing months with data
        const monthMap = data.details.reduce((map, detail) => {
          map[detail.FIRE_MONTH] = parseFloat(detail.SUM_AREA);
          return map;
        }, {});

        // Find the earliest month with data
        const earliestMonth = Math.min(...Object.keys(monthMap).map(Number));

        // Add data for the earliest month with value 0 if it's missing
        if (!monthMap[earliestMonth]) {
          countryData.push({
            x: new Date(FIRE_YEAR, earliestMonth - 1),
            y: 0
          });
        }

        // Add data for existing months
        Object.keys(monthMap).forEach(month => {
          if (month >= earliestMonth) {
            countryData.push({
              x: new Date(FIRE_YEAR, month),
              y: monthMap[month]
            });
          }
        });

        if(data.yearly.PV_EN){
          acc[PV_EN] = countryData;
        }else if(data.yearly.AP_EN){
          acc[AP_EN] = countryData;
        }else{
          acc[COUNTRY] = countryData;
        }
        return acc;
      }, {});

      
      const series = Object.keys(groupedData).map(country => ({
        name: country,
        data: groupedData[country].sort((a, b) => a.x - b.x) // Sort by date
      }));


      setSeriesData(series);
    };

    processData();
  }, [dataFromRedux]);

  const options = {
    chart: {
      type: 'line',
      height: 350,
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
      type: 'datetime',
      title: {
        text: 'Date'
      }
    },
    yaxis: {
      title: {
        text: 'Burnt Area (sq m)'
      },
      labels: {
        formatter: (value) => {
          return value ? `${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '0.00';
        }
      }
    },
    tooltip: {
      x: {
        format: 'MMM yyyy'
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      floating: true
    }
  };
  
 
  return (
    <div>
      <ReactApexChart options={options} series={seriesData} type="line" height={350} />
    </div>
  );
};

export default LineChart;
