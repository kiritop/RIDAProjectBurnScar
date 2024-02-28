const express = require('express');
const AdmZip = require('adm-zip');
const shapefile = require('shapefile');

const app = express();

app.get('/read-shapefile', async (req, res) => {
    // Assuming the zipfile is in the same directory as your script
    const zip = new AdmZip('./shapefile.zip');

    // Extract all files to /output directory
    zip.extractAllTo('./output', /*overwrite*/true);

    // Assuming the shapefile is named 'shapefile.shp'
    const shapefilePath = './output/shapefile.shp';

    let features = [];
    await shapefile.open(shapefilePath)
        .then(source => source.read()
            .then(function log(result) {
                if (result.done) return;
                features.push(result.value);
                return source.read().then(log);
            })
        );

    res.json(features);
});

const port = 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));