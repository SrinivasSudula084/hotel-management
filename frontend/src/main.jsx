import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { Toaster } from "react-hot-toast";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';


ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 2500,
        style: {
          background: "rgba(30,30,35,0.85)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(6px)",
          color: "#fff",
          borderRadius: "10px",
          fontSize: "14px"
        }
      }}
    />
  </BrowserRouter>
);
