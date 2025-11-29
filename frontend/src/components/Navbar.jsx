// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css"; // you can reuse your existing nav CSS

export default function Navbar({ active = "home" }) {
  const navigate = useNavigate();

  
  return (
    <nav className="ud-nav1">
      <div className="ud-nav-left1">
        <div className="ud-logo1">
          Lux<span>Stay</span>
        </div>
        <div className="ud-slogan1">Find the perfect stay</div>
      </div>

      <div className="ud-nav-right1">
        <Link
          to="/user/dashboard"
          className={active === "home" ? "nav-link active" : "nav-link1"}
        >
          Home
        </Link>

        <Link
          to="/hotels"
          className={active === "hotels" ? "nav-link active" : "nav-link1"}
        >
          View Hotels
        </Link>

        <Link
          to="/my-bookings"
          className={active === "bookings" ? "nav-link active" : "nav-link1"}
        >
          My Bookings
        </Link>

         <Link to="/login" className="nav-link1" onClick={() => {
                    localStorage.removeItem("token");
    localStorage.removeItem("user");
                    navigate("/login");
                  }}>
                    Logout
                  </Link>
      </div>
    </nav>
  );
}
