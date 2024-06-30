import React, { useState, useEffect } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';
import { Button, Grid, Typography } from '@mui/material';
import { useSelector } from "react-redux";

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const DrilldownHotspotChart = () => {
  const dataFromRedux = useSelector((state) => state.dashboard.dataHotspotChart ?? []);
  const [drilldownData, setDrilldownData] = useState(null);
  const [options, setOptions] = useState({});

  useEffect(() => {
    const processData = () => {
      const groupedData = dataFromRedux.reduce((acc, data) => {
        const { COUNTRY, HOT_SPOT_YEAR, PV_EN, AP_EN } = data.yearly;
        let countryKey;

        if (PV_EN) {
          countryKey = PV_EN;
        } else if (AP_EN) {
          countryKey = AP_EN;
        } else {
          countryKey = COUNTRY || "Unknown";
        }

        if (!acc[countryKey]) {
          acc[countryKey] = [];
        }

        acc[countryKey].push({
          HOT_SPOT_YEAR,
          SUM_HOTSPOT: parseFloat(data.yearly.SUM_HOTSPOT),
          details: data.details
        });

        return acc;
      }, {});

      const aggregatedData = Object.entries(groupedData).map(([key, value]) => {
        const totalSumArea = value.reduce((sum, item) => sum + item.SUM_HOTSPOT, 0);
        return {
          label: key,
          y: totalSumArea,
          details: value.flatMap(item => item.details),
          yearly: value.map(item => ({ COUNTRY: key, HOT_SPOT_YEAR: item.HOT_SPOT_YEAR }))
        };
      }).sort((a, b) => b.y - a.y);

      setOptions({
        animationEnabled: true,
        theme: "light2",
        axisX: {
          title: "Country",
          interval: 1,
          labelAngle: -45
        },
        axisY: {
          title: "Sum of Hot Spot",
          labelFormatter: function (e) {
            return CanvasJSReact.CanvasJS.formatNumber(e.value, "#,###");
          }
        },
        toolTip: {
          shared: true,
          contentFormatter: function (e) {
            let content = `<strong>${e.entries[0].dataPoint.label}</strong><br>`;
            e.entries.forEach(function (entry) {
              const years = entry.dataPoint.yearly.map(y => y.HOT_SPOT_YEAR).join(", ");
              content += `Hotspot: ${CanvasJSReact.CanvasJS.formatNumber(entry.dataPoint.y, "#,###")}(${years})<br>`;
            });
            return content;
          }
        },
        data: [{
          type: "column",
          dataPoints: aggregatedData.map(item => ({
            label: item.label,
            y: item.y,
            yearly: item.yearly,
            click: () => handleDrilldown(item)
          }))
        }]
      });
    };

    processData();
  }, [dataFromRedux]);

  const handleDrilldown = (item) => {
    const monthData = item.details.reduce((acc, detail) => {
      const yearMonth = `${detail.HOT_SPOT_YEAR}-${detail.HOT_SPOT_MONTH}`;
      if (!acc[yearMonth]) {
        acc[yearMonth] = {
          x: new Date(detail.HOT_SPOT_YEAR, detail.HOT_SPOT_MONTH - 1),
          y: 0
        };
      }
      acc[yearMonth].y += parseFloat(detail.SUM_HOTSPOT);
      return acc;
    }, {});

    const dataPoints = Object.values(monthData).sort((a, b) => a.x - b.x);

    const drilldownOptions = {
      animationEnabled: true,
      theme: "light2",
      axisX: {
        title: "Month",
        interval: 1,
        valueFormatString: "MMM YYYY"
      },
      axisY: {
        title: "Sum of Hot Spot",
        labelFormatter: function (e) {
          return CanvasJSReact.CanvasJS.formatNumber(e.value, "#,###");
        }
      },
      toolTip: {
        shared: true,
        contentFormatter: function (e) {
          let content = `<strong>${item.label}</strong><br>`;
          e.entries.forEach(function (entry) {
            content += `Month ${entry.dataPoint.x.toLocaleDateString('default', { month: 'short', year: 'numeric' })}: ${CanvasJSReact.CanvasJS.formatNumber(entry.dataPoint.y, "#,###")}<br>`;
          });
          return content;
        }
      },
      data: [{
        type: "line",
        dataPoints
      }]
    };
    setDrilldownData(drilldownOptions);
  };

  const handleBack = () => {
    setDrilldownData(null);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
         Hotspot by Time
        </Typography>
        <Button onClick={handleBack} disabled={!drilldownData}>Back</Button>
      </Grid>
      <Grid item xs={12}>
        <CanvasJSChart options={drilldownData || options} />
      </Grid>
    </Grid>
  );
};

export default DrilldownHotspotChart;
