/* eslint-disable no-unused-vars */
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Map from "./pages/Map";
import Course from "./pages/Course";
import AboutUS from "./pages/Aboutus";
import API from "./pages/API";
import "./App.css";
import LoginPage from "./pages/loginpage";
import Layout from "./components/layout";

function App() {
  return (
    <div className="background">
    <Layout>
      <Routes>
        <Route path="/" element={<Map />} />
        <Route path="/learning_material" element={<Course />} />
        <Route path="/api" element={<API />} />
        <Route path="/about_us" element={<AboutUS />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Layout></div>
  );
}

export default App;
