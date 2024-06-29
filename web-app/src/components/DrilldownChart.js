import React, { useState, useEffect } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';
import { Button, Grid, Typography } from '@mui/material';
import { useSelector } from "react-redux";

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const DrilldownChart = () => {
  const dataFromRedux = useSelector((state) => state.dashboard.dataBurntChart ?? []);
  const [drilldownData, setDrilldownData] = useState(null);
  const [options, setOptions] = useState({});

  useEffect(() => {
    const processData = () => {
      const groupedData = dataFromRedux.reduce((acc, data) => {
        const { COUNTRY, FIRE_YEAR, PV_EN, AP_EN } = data.yearly;
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
          FIRE_YEAR,
          SUM_AREA: parseFloat(data.yearly.SUM_AREA),
          details: data.details
        });

        return acc;
      }, {});

      const aggregatedData = Object.entries(groupedData).map(([key, value]) => {
        const totalSumArea = value.reduce((sum, item) => sum + item.SUM_AREA, 0);
        return {
          label: key,
          y: totalSumArea,
          details: value.flatMap(item => item.details),
          yearly: value.map(item => ({ COUNTRY: key, FIRE_YEAR: item.FIRE_YEAR }))
        };
      });

      setOptions({
        animationEnabled: true,
        theme: "light2",
        title: {
          text: "Yearly Burnt Area"
        },
        axisX: {
          title: "Country",
          interval: 1,
          labelAngle: -45
        },
        axisY: {
          title: "Sum Area",
          labelFormatter: function (e) {
            return CanvasJSReact.CanvasJS.formatNumber(e.value, "#,###");
          }
        },
        toolTip: {
          shared: true,
          contentFormatter: function (e) {
            let content = `<strong>${e.entries[0].dataPoint.label}</strong><br>`;
            e.entries.forEach(function (entry) {
              const years = entry.dataPoint.yearly.map(y => y.FIRE_YEAR).join(", ");
              content += `Area: ${CanvasJSReact.CanvasJS.formatNumber(entry.dataPoint.y, "#,###")} sq m (${years})<br>`;
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
      const yearMonth = `${detail.FIRE_YEAR}-${detail.FIRE_MONTH}`;
      if (!acc[yearMonth]) {
        acc[yearMonth] = {
          x: new Date(detail.FIRE_YEAR, detail.FIRE_MONTH - 1),
          y: 0
        };
      }
      acc[yearMonth].y += parseFloat(detail.SUM_AREA);
      return acc;
    }, {});

    const dataPoints = Object.values(monthData).sort((a, b) => a.x - b.x);

    const drilldownOptions = {
      animationEnabled: true,
      theme: "light2",
      title: {
        text: `Monthly Burnt Area in ${item.label}`
      },
      axisX: {
        title: "Month",
        interval: 1,
        valueFormatString: "MMM YYYY"
      },
      axisY: {
        title: "Sum Area",
        labelFormatter: function (e) {
          return CanvasJSReact.CanvasJS.formatNumber(e.value, "#,###");
        }
      },
      toolTip: {
        shared: true,
        contentFormatter: function (e) {
          let content = `<strong>${item.label}</strong><br>`;
          e.entries.forEach(function (entry) {
            content += `Month ${entry.dataPoint.x.toLocaleDateString('default', { month: 'short', year: 'numeric' })}: ${CanvasJSReact.CanvasJS.formatNumber(entry.dataPoint.y, "#,###")} sq m<br>`;
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
         Burnt Area by Time
        </Typography>
        <Button onClick={handleBack} disabled={!drilldownData}>Back</Button>
      </Grid>
      <Grid item xs={12}>
        <CanvasJSChart options={drilldownData || options} />
      </Grid>
    </Grid>
  );
};

export default DrilldownChart;
