// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducers";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { GoogleOAuthProvider } from "@react-oauth/google";
import CONFIG from './config';

const store = configureStore({ reducer: rootReducer });

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <Router>
      <GoogleOAuthProvider clientId={CONFIG.GOOGLE_AUTH_API_KEY}>
        <App />
      </GoogleOAuthProvider>
    </Router>
  </Provider>
);

reportWebVitals();
