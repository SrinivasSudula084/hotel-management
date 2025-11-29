import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Navbar from "../../components/Navbar1";
import { useNavigate } from "react-router-dom";
import "./OwnerHotelsList.css";

// ⭐ Import resolver
import resolveImage from "../../utils/resolveImage";

export default function OwnerHotelsList() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchHotels() {
      try {
        const res = await api.get("/owner/hotels/my-hotels", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setHotels(res.data.hotels || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }

    fetchHotels();
  }, []);

  if (loading) return <h3 className="loading-text">Loading hotels...</h3>;

  return (
    <div className="owner-hotels-page">

      {/* Navbar */}
      <Navbar />

      <h2 className="page-title">Your Hotels</h2>

      {hotels.length === 0 ? (
        <p className="empty-text">No hotels added yet.</p>
      ) : (
        <div className="hotels-grid">
          {hotels.map((hotel) => {
            const loc = hotel.location;
            const displayLocation = loc?.city
              ? `${loc.city}${loc.state ? ", " + loc.state : ""}`
              : "Location unavailable";

            // ⭐ FIXED IMAGE URL
            const rawImg = hotel.images?.[0];
            const finalImg = resolveImage(rawImg) 
              || "https://cdn-icons-png.flaticon.com/512/2748/2748558.png";

            return (
              <div key={hotel._id} className="hotel-card">
                
                <img
                  src={finalImg}
                  alt={hotel.name}
                  className="hotel-image"
                />

                <h3 className="hotel-title">{hotel.name}</h3>

                {hotel.approved ? (
                  <span className="badge badge-approved">Approved</span>
                ) : (
                  <span className="badge badge-pending">Pending Approval</span>
                )}

                <p className="hotel-location">{displayLocation}</p>

                <button
                  className="view-btn"
                  onClick={() => navigate(`/owner/hotel/${hotel._id}`)}
                >
                  View Hotel
                </button>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
