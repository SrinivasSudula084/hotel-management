import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar1";
import "./OwnerDashboard.css";

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setOwner(res.data.user);
      } catch (err) {
        console.error("Owner fetch failed:", err);
      }
    };

    fetchOwner();
  }, []);

  return (
    <div className="owner-dashboard">

      {/* Verification Message */}
      {owner && !owner.verified && (
        <p className="verify-msg">Your account is not verified yet.</p>
      )}

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="owner-hero">
        <div className="owner-hero-overlay">
          <h1 className="hero-title">Owner Dashboard</h1>
          <p className="hero-quote">
            “Manage all your hotel operations from one place — fast and easy.”
          </p>

          <div className="hero-buttons">
            <button onClick={() => navigate("/owner/add-hotel")} className="hero-btn">
              ➕ Add Hotel
            </button>

            <button onClick={() => navigate("/owner/hotels")} className="hero-btn">
              🏨 View Hotels
            </button>

            <button
              onClick={() => navigate("/owner/hotels/bookings/all")}
              className="hero-btn"
            >
              📑 View Bookings
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="owner-footer">
        <p>© {new Date().getFullYear()} LuxStay – Owner Panel</p>
      </footer>
    </div>
  );
}
