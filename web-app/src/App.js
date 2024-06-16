/* eslint-disable no-unused-vars */
import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Map from "./pages/Map";
import Course from "./pages/Course";
import AboutUS from "./pages/Aboutus";
import API from "./pages/API";
import "./App.css";
import LoginPage from "./pages/loginpage";
import Layout from "./components/layout";
import HotSpotDashboard from "./pages/HotSpotDashboard";
import AirQualityDashboard from "./pages/AirQualityDashboard";
import BurntScar from "./pages/BurntScarDashboard";

function App() {
  return (
    <div className="background">
      <Layout>
        <Routes>
          <Route path="/" element={<Map />} />
          <Route path="/hot_spot" element={<HotSpotDashboard />} />
          <Route path="/pm_25" element={<AirQualityDashboard />}></Route>
          <Route path="/burn_scar" element={<BurntScar />}></Route>
          <Route path="/learning_material" element={<Course />} />
          <Route path="/api" element={<API />} />
          <Route path="/about_us" element={<AboutUS />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
