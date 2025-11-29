// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar1.css"; // you can reuse your existing nav CSS

export default function Navbar({ active = "home" }) {
  const navigate = useNavigate();

  
  return (
    <nav className="ud-nav">
      <div className="ud-nav-left">
        <div className="ud-logo">
          Lux<span>Stay</span>
        </div>
        <div className="ud-slogan">Find the perfect stay</div>
      </div>

      <div className="ud-nav-right">
        <Link
          to="/owner/dashboard"
          className={active === "home" ? "nav-link active" : "nav-link"}
        >
          Home
        </Link>
        <Link
          to="/owner/add-hotel"
          className={active === "bookings" ? "nav-link active" : "nav-link"}
        >Add hotels</Link>
        <Link
          to="/owner/hotels"
          className={active === "hotels" ? "nav-link active" : "nav-link"}
        >
          View Hotels
        </Link>

        <Link
          to="/owner/hotels/bookings/all"
          className={active === "bookings" ? "nav-link active" : "nav-link"}
        >
          View Bookings
        </Link>
        
         <Link to="/owner/login" className="nav-link" onClick={() => {
                    localStorage.removeItem("token");
    localStorage.removeItem("user");
                    navigate("/owner/login");
                  }}>
                    Logout
                  </Link>
      </div>
    </nav>
  );
}
