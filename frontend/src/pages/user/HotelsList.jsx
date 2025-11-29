// src/pages/user/HotelsList.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./HotelsList.css";
import api from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";

function getLocation(loc) {
  if (!loc) return "Unknown";
  if (typeof loc === "string") return loc;
  const { city, state } = loc;
  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  return "Unknown";
}

export default function HotelsList() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("new"); // new → old

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await api.get("/hotels?limit=500");
        if (!mounted) return;
        setHotels(res.data.hotels || []);
      } catch (err) {
        console.error("Hotels loading failed:", err);
        setHotels([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  // ⭐ FILTERING + SEARCH + SORTING + PRICE
  const filteredHotels = useMemo(() => {
    let list = [...hotels];

    // search by name / description / city
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          (h.description || "").toLowerCase().includes(q) ||
          (h.location?.city || "").toLowerCase().includes(q)
      );
    }

    // price filter
    if (maxPrice) {
      list = list.filter((h) => {
        const rooms = h.rooms || [];
        const minPrice = rooms.length ? Math.min(...rooms.map((r) => r.pricePerNight)) : Infinity;
        return minPrice <= Number(maxPrice);
      });
    }

    // sort
    if (sortOrder === "new") {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // newest first
    } else {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // oldest first
    }

    return list;
  }, [hotels, query, maxPrice, sortOrder]);

  return (
    <div className="hl-root">

      {/* NAVBAR (same as dashboard) */}
      <nav className="ud-nav2">
        <div className="ud-nav-left2">
          <div className="ud-logo2">Lux<span>Stay</span></div>
          <div className="ud-slogan2">Find your perfect stay</div>
        </div>

        <div className="ud-nav-right2">
          <Link to="/user/dashboard" className="nav-link2">Home</Link>
          <Link to="/hotels" className="nav-link2">View Hotels</Link>
          <Link to="/my-bookings" className="nav-link2">My Bookings</Link>

          <Link to="/login" className="nav-link2" onClick={() => {
            localStorage.removeItem("token");
    localStorage.removeItem("user");
            navigate("/login");
          }}>
            Logout
          </Link>
        </div>
      </nav>

      {/* MAIN BODY */}
      <div className="hl-container">

        <h1 className="hl-title">Explore Hotels</h1>

        {/* SEARCH + FILTERS */}
        <div className="hl-filters glass-lite">

          <input
            className="hl-input"
            placeholder="Search hotels..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <input
            className="hl-input"
            type="number"
            placeholder="Max Price (₹)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />

          <select
            className="hl-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="new">Newest → Oldest</option>
            <option value="old">Oldest → Newest</option>
          </select>

        </div>

        {/* HOTEL GRID */}
        <div className="hl-grid">
          {loading ? (
            <div className="loading">Loading hotels…</div>
          ) : filteredHotels.length === 0 ? (
            <div className="empty">No hotels match your filters.</div>
          ) : (
            filteredHotels.map((hotel) => (
              <HotelCard key={hotel._id} hotel={hotel} navigate={navigate} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* HOTEL CARD (same as dashboard) */
function HotelCard({ hotel, navigate }) {
  const img = hotel.images?.[0] || "/placeholder.png";

  const minPrice = hotel.rooms?.length
    ? Math.min(...hotel.rooms.map((r) => r.pricePerNight))
    : null;

  return (
    <article className="hotel-card1">
      <div className="card-img-wrapper">
        <img
          src={img}
          alt={hotel.name}
          className="card-img"
          onError={(e) => (e.target.src = "/placeholder.png")}
        />
        {minPrice && <div className="price-tag">₹{minPrice}</div>}
      </div>

      <div className="card-body">
        <h3 className="hotel-title">{hotel.name}</h3>
        <p className="hotel-city">📍 {getLocation(hotel.location)}</p>

        <p className="hotel-desc">
          {hotel.description?.slice(0, 90) || "—"}
          {hotel.description?.length > 90 ? "..." : ""}
        </p>

        <div className="card-actions">
          <button
            className="view-btn"
            onClick={() => navigate(`/hotels/${hotel._id}`)}
          >
            View Details
          </button>
        </div>
      </div>
    </article>
  );
}
