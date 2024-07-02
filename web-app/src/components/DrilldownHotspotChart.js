import React, { useState, useEffect } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';
import { Button, Grid, Typography } from '@mui/material';
import { useSelector } from "react-redux";

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const DrilldownChart = () => {
  const dataFromRedux = useSelector((state) => state.dashboard.dataDDHotspotChart ?? []);
  const [drilldownData, setDrilldownData] = useState(null);
  const [options, setOptions] = useState({});

  useEffect(() => {
    const processData = () => {
      const groupedData = dataFromRedux.map(data => {
        const label = data.yearly.AP_EN || data.yearly.PV_EN || data.yearly.COUNTRY || 'Unknown';
        const axisTitle = data.yearly.AP_EN ? "District" : data.yearly.PV_EN ? "Province" : "Country";

        return {
          label,
          y: parseFloat(data.yearly.SUM_HOTSPOT),
          details: data.details,
          axisTitle
        };
      }).sort((a, b) => b.y - a.y);

      setOptions({
        animationEnabled: true,
        theme: "light2",
        axisX: {
          title: groupedData[0]?.axisTitle || "Location",
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
              content += `Area: ${CanvasJSReact.CanvasJS.formatNumber(entry.dataPoint.y, "#,###")} points<br>`;
            });
            return content;
          }
        },
        data: [{
          type: "column",
          dataPoints: groupedData.map(item => ({
            label: item.label,
            y: item.y,
            click: () => handleDrilldown(item)
          }))
        }]
      });
    };

    processData();
  }, [dataFromRedux]);

  const handleDrilldown = (item) => {
    if (item.details.length === 0) return;

    const detailKey = item.details[0].AP_EN ? "AP_EN" : "PV_EN";
    const axisTitle = detailKey === "AP_EN" ? "District" : "Province";

    const detailData = item.details.map(detail => ({
      label: detail[detailKey] || 'Unknown',
      y: parseFloat(detail.SUM_HOTSPOT)
    })).sort((a, b) => b.y - a.y);

    const drilldownOptions = {
      animationEnabled: true,
      theme: "light2",
      axisX: {
        title: axisTitle,
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
            content += `Area: ${CanvasJSReact.CanvasJS.formatNumber(entry.dataPoint.y, "#,###")} points<br>`;
          });
          return content;
        }
      },
      data: [{
        type: "column",
        dataPoints: detailData
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
        <Typography variant="h4" component="div" gutterBottom>
          Hotspot
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
