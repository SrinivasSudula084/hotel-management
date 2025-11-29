import React from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";   // 🔥 luxury theme styles

export default function Home() {
  return (
    <div className="home-root">
      <div className="home-box">

        <h1 className="home-title">LuxStay</h1>
        <p className="home-subtitle">Choose how you want to enter</p>

        <div className="home-options">
          <Link to="/login" className="home-btn">User Login</Link>
          <Link to="/owner/login" className="home-btn">Owner Login</Link>
          <Link to="/register" className="home-btn-alt">Register (User)</Link>
        </div>

        <small className="home-hint">
          Admin login: <span>/admin/login?key=SUPERADMIN123,email: admin@gmail.com , password: admin123
          </span>
        </small>

      </div>
    </div>
  );
}
