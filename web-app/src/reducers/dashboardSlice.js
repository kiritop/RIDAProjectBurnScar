// src/reducers/aqiSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Papa from "papaparse";
import CONFIG from "../config";
import { geocode } from "react-geocode";

const date = new Date();
const formattedDate = date.toISOString().slice(0, 10);

console.log(formattedDate);

export const fetchProvinceByCountry = createAsyncThunk("dashboard/fetchProvinceByCountry", async (country) => {
  try{
    const response = await fetch(`${CONFIG.API_URL}/get-province?country=${country}`);
    const data = await response.json();
    return data;
  }catch (error){
    console.error(error);
    return null;
  }

});

export const fetchDataForBubble = createAsyncThunk("dashboard/fetchDataForBubble", async (object) => {
  try{
    const response = await fetch(`${CONFIG.API_URL}/get-data-for-bubble?country=${object.country}&province=${object.province}&fromDate=${object.startDate}&toDate=${object.endDate}`);
    const data = await response.json();
    return data;
  }catch (error){
    console.error(error);
    return null;
  }

});

export const fetchDataPoint = createAsyncThunk("dashboard/fetchDataPoint", async (object) => {
  try{
    const response = await fetch(`${CONFIG.API_URL}/get-data-for-point?country=${object.country}&province=${object.province}&fromDate=${object.startDate}&toDate=${object.endDate}`);
    const data = await response.json();
    return data;
  }catch (error){
    console.error(error);
    return null;
  }

});




export const fetchHotspotData = createAsyncThunk("dashboard/fetchHotspotData", async () => {
  const urls = [
    `https://firms.modaps.eosdis.nasa.gov/api/country/csv/579db9c41c852c1f75bc6b73f8b90262/MODIS_NRT/THA/1/${formattedDate}`,
    `https://firms.modaps.eosdis.nasa.gov/api/country/csv/579db9c41c852c1f75bc6b73f8b90262/MODIS_NRT/MMR/1/${formattedDate}`,
    `https://firms.modaps.eosdis.nasa.gov/api/country/csv/579db9c41c852c1f75bc6b73f8b90262/MODIS_NRT/LAO/1/${formattedDate}`,
    `https://firms.modaps.eosdis.nasa.gov/api/country/csv/579db9c41c852c1f75bc6b73f8b90262/MODIS_NRT/VNM/1/${formattedDate}`,
  ];

  const promises = urls.map(async (url) => {
    try {
      const response = await axios.get(url);
      const csvData = response.data;

      let data;
      Papa.parse(csvData, {
        header: true,
        complete: (result) => {
          data = result.data;
        },
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return data.length;
    } catch (error) {
      console.error(error);
      return null;
    }
  });

  const DashboardData = await Promise.all(promises);

  return DashboardData;
});

export const fetchHotspotDataCountry = createAsyncThunk("dashboard/fetchHotspotDataCountry", async (country) => {
  try {
    const url = `https://firms.modaps.eosdis.nasa.gov/api/country/csv/579db9c41c852c1f75bc6b73f8b90262/MODIS_NRT/${country}/1/${formattedDate}`;
    const response = await axios.get(url);
    const csvData = response.data;

    // Parse the CSV data
    let data;
    Papa.parse(csvData, {
      header: true,
      complete: (result) => {
        data = result.data;
      },
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Assuming you have 'lat' and 'lng' variables defined earlier
    const lat = data.map((e) => parseFloat(e.latitude));
    const lng = data.map((e) => parseFloat(e.longitude));

    // Now let's use the geocode function
    const GeoCode = await Promise.all(
      lat.map(async (latValue, index) => {
        const lngValue = lng[index];
        try {
          const geoResponse = await geocode("latlng", `${latValue},${lngValue}`, {
            key: "AIzaSyDAkYIl8ommjBg7jW22-2Oqg3yWbG5tTmE", // Replace with your actual API key
            language: "en",
          });
          const countryName = geoResponse?.results[0]?.address_components[3]?.long_name;
          const Count = geoResponse?.results?.length;

          return { country: countryName, count: Count };
        } catch (geoError) {
          console.error(geoError);
        }
      })
    );
    console.log(GeoCode);
    return GeoCode;
  } catch (error) {
    console.error(error);
    return null;
  }
});

export const fetchPM25Data = createAsyncThunk("dashboard/fetchPM25Data", async (country) => {
  const promises = country.map(async (location) => {
    const url = `https://api.waqi.info/feed/geo:${location.lat};${location.lng}/?token=${CONFIG.AQI_API_KEY}`;
    try {
      const response = await axios.get(url);

      const pm25Value = response?.data?.data?.iaqi?.pm25?.v;
      return { city: location.city, pm25: pm25Value };
      // return { ...location, aqi: response.data.data.iaqi };
    } catch (error) {
      console.error(error);
      return null;
    }
  });

  // รอให้ทุก promises สำเร็จแล้วคืนค่าผลลัพธ์
  const DashboardData = await Promise.all(promises);
  DashboardData.sort((a, b) => b.pm25 - a.pm25);

  return DashboardData;
});

export const DashboardSlice = createSlice({
  name: "dashboard",
  initialState: { 
    dataHotspot: [], 
    dataHotspotCountry: [], 
    dataPM25: [], 
    loading: false,
    dataProvince:[],
    dataBubble:[],
    dataPoint:[]
  },
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotspotData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHotspotData.fulfilled, (state, action) => {
        state.dataHotspot = action.payload;
        state.loading = false;
      })
      .addCase(fetchHotspotDataCountry.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHotspotDataCountry.fulfilled, (state, action) => {
        state.dataHotspotCountry = action.payload;
        state.loading = false;
      })
      .addCase(fetchPM25Data.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPM25Data.fulfilled, (state, action) => {
        state.dataPM25 = action.payload;
        state.loading = false;
      })
      .addCase(fetchProvinceByCountry.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProvinceByCountry.fulfilled, (state, action) => {
        state.dataProvince = action.payload;
        state.loading = false;
      })
      .addCase(fetchDataForBubble.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDataForBubble.fulfilled, (state, action) => {
        state.dataBubble = action.payload;
        state.loading = false;
      })
      .addCase(fetchDataPoint.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDataPoint.fulfilled, (state, action) => {
        state.dataPoint = action.payload;
        state.loading = false;
      })
      
      
  },
});

export const { setFilter } = DashboardSlice.actions;

export default DashboardSlice.reducer;