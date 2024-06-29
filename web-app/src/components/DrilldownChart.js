import React, { useState } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';
import { Button, Grid, Typography } from '@mui/material';
import { useSelector } from "react-redux";

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const DrilldownChart = () => {
  const dataFromRedux = useSelector((state) => state.dashboard.dataBurntChart ?? []);
  const [drilldownData, setDrilldownData] = useState(null);

  const options = {
    animationEnabled: true,
    theme: "light2",
    title: {
      text: "Yearly Fire Area by Country"
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
        let content = `<strong>${e.entries[0].dataPoint.label} (${dataFromRedux[e.entries[0].dataPoint.x].yearly.FIRE_YEAR})</strong><br>`;
        e.entries.forEach(function (entry) {
          content += `Area: ${CanvasJSReact.CanvasJS.formatNumber(entry.dataPoint.y, "#,###")} sq m<br>`;
        });
        return content;
      }
    },
    data: [{
      type: "column",
      indexLabelPlacement: "outside",
      dataPoints: dataFromRedux.map((item, index) => ({
        label: item.yearly.COUNTRY,
        x: index, // Use index to reference back to dataFromRedux in tooltip
        y: parseFloat(item.yearly.SUM_AREA),
        click: () => handleDrilldown(item)
      }))
    }]
  };

  const handleDrilldown = (item) => {
    const drilldownOptions = {
      animationEnabled: true,
      theme: "light2",
      title: {
        text: `Monthly Fire Area in ${item.yearly.COUNTRY} (${item.yearly.FIRE_YEAR})`
      },
      axisX: {
        title: "Month",
        interval: 1
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
          let content = `<strong>${item.yearly.COUNTRY} (${item.yearly.FIRE_YEAR})</strong><br>`;
          e.entries.forEach(function (entry) {
            content += `Month ${entry.dataPoint.label}: ${CanvasJSReact.CanvasJS.formatNumber(entry.dataPoint.y, "#,###")} sq m<br>`;
          });
          return content;
        }
      },
      data: [{
        type: "column",
        indexLabel: "{y}",
        indexLabelFontColor: "#5A5757",
        indexLabelPlacement: "outside",
        dataPoints: item.details.map(detail => ({
          label: detail.FIRE_MONTH,
          y: parseFloat(detail.SUM_AREA)
        }))
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
          {drilldownData ? `Monthly Fire Area Details` : `Yearly Fire Area by Country`}
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
