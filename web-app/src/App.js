import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Map from './pages/Map';
import Course from './pages/Course'
import AboutUS from './pages/Aboutus';
import API from './pages/API';
import './App.css';
import LoginPage from './pages/loginpage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Map />} />
        <Route path="/learning_material" element={<Course />} />       
        <Route path="/api" element={<API />} />       
        <Route path="/about_us" element={<AboutUS />} />       
        <Route path="/login" element={<LoginPage />} />       
      </Routes>
    </Router>
  );
}

export default App;