import React, { useEffect, useMemo, useState } from "react";
import "./UserHotelPage.css";
import api from "../../api/axios";
import { Link, useNavigate, useParams } from "react-router-dom";

/**
 * UserHotelPage.jsx
 * - Neon glow "B" tile style
 * - Category tabs (Regular / Deluxe / Suite)
 * - Click tile to select -> opens floating booking panel
 * - Uses /api/hotels/:hotelId to fetch hotel (populated rooms)
 */

export default function UserHotelPage() {
  const { hotelId } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI
  const [activeTab, setActiveTab] = useState("All");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async function load() {
      try {
        setLoading(true);
        const res = await api.get(`/hotels/${hotelId}`);
        if (!mounted) return;
        setHotel(res.data.hotel || null);
      } catch (err) {
        console.error("Failed to load hotel", err);
        setError("Failed to load hotel details.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [hotelId]);

  const rooms = hotel?.rooms || [];

  // categorize rooms
  const categories = useMemo(() => {
    const map = { All: rooms };
    map.Regular = rooms.filter(r => r.category === "Regular");
    map.Deluxe = rooms.filter(r => r.category === "Deluxe");
    map.Suite = rooms.filter(r => r.category === "Suite");
    return map;
  }, [rooms]);

  // price range
  const priceRange = useMemo(() => {
    if (!rooms.length) return null;
    const prices = rooms.map(r => r.pricePerNight || 0);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [rooms]);

  function onTileClick(room) {
    setSelectedRoom(room);
    setPanelOpen(true);
    // tile remains visually selected via selectedRoom state
  }

  function handleViewRoom(roomId) {
    navigate(`/room/${roomId}`);
  }

  function handleBookRoom(roomId) {
    // navigate to booking flow / room page
    navigate(`/room/${roomId}`);
  }

  if (loading) return <div className="uhp-loading">Loading hotel...</div>;
  if (error) return <div className="uhp-error">{error}</div>;
  if (!hotel) return <div className="uhp-error">Hotel not found.</div>;

  return (
    <div className="uhp-root">

      {/* NAVBAR (same premium dark nav) */}
      <nav className="ud-nav2">
        <div className="ud-nav-left2">
          <div className="ud-logo2">Lux<span>Stay</span></div>
          <div className="ud-slogan2">Find your perfect stay</div>
        </div>

        <div className="ud-nav-right2">
          <Link to="/user/dashboard" className="nav-link2">Home</Link>
          <Link to="/hotels" className="nav-link2">View Hotels</Link>
          <Link to="/my-bookings" className="nav-link2">My Bookings</Link>
          <Link to="/logout" className="nav-link2" onClick={() => {  localStorage.removeItem("token");
    localStorage.removeItem("user"); navigate("/login"); }}>
            Logout
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <header className="uhp-hero">
        <div className="uhp-hero-media">
          <img
            src={hotel.images?.[0] || "/placeholder.png"}
            alt={hotel.name}
            className="uhp-hero-img"
            onError={(e) => e.target.src = "/placeholder.png"}
          />
        </div>

        <div className="uhp-hero-info glass-lite">
          <div className="uhp-title-row">
            <h1 className="uhp-name">{hotel.name}</h1>
            <div className="uhp-actions">
              {priceRange && <div className="uhp-price">₹{priceRange.min} - ₹{priceRange.max} / night</div>}
              <button className="btn-glow" onClick={() => window.scrollTo({ top: document.querySelector('.uhp-rooms')?.offsetTop || 600, behavior: 'smooth' })}>
                View Rooms
              </button>
            </div>
          </div>

          <div className="uhp-meta">
            <div className="uhp-location">📍 {hotel.location?.city || hotel.location?.address || "Location unknown"}</div>
            <div className="uhp-rating">⭐ {hotel.avgRating || "—"} ({hotel.ratingsCount || 0})</div>
          </div>

          <div className="uhp-desc">{hotel.description || "No description provided."}</div>

          <div className="uhp-amenities">
            {(hotel.amenities || []).slice(0, 8).map((a, idx) => (
              <div className="amenity-pill" key={idx}>{a}</div>
            ))}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT: Rooms */}
      <main className="uhp-main container">

        {/* tabs */}
        <div className="uhp-tabs glass-lite">
          {["All", "Regular", "Deluxe", "Suite"].map(tab => (
            <button
              key={tab}
              className={`uhp-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab); setSelectedRoom(null); setPanelOpen(false); }}
            >
              {tab} {categories[tab]?.length ? `(${categories[tab].length})` : ''}
            </button>
          ))}
        </div>

        {/* rooms area */}
        <section className="uhp-rooms">
          {categories[activeTab]?.length === 0 ? (
            <div className="uhp-empty">No rooms available in this category.</div>
          ) : (
            <div className="uhp-tiles">
              {categories[activeTab].map(room => (
                <div
                  key={room._id}
                  className={`room-tile ${selectedRoom?._id === room._id ? 'selected' : ''}`}
                  onClick={() => onTileClick(room)}
                >
                  <div className="tile-number">{room.roomNumber}</div>
                  <div className="tile-meta">
                    <div className="tile-cat">{room.category}</div>
                    <div className="tile-price">₹{room.pricePerNight}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* descriptions and details columns */}
        <section className="uhp-details glass-lite">
          <div className="detail-left">
            <h3>Hotel Details</h3>
            <p>{hotel.description}</p>

            <h4>Amenities</h4>
            <div className="amenities-grid">
              {(hotel.amenities || []).map((a, i) => <div key={i} className="amenity-item">{a}</div>)}
            </div>
          </div>

          <div className="detail-right">
            <div className="booking-card">
              <div className="booking-head">Quick Info</div>
              <div className="booking-body">
                <div><strong>Address:</strong> {hotel.location?.address || hotel.location?.city || "N/A"}</div>
                <div><strong>Listed:</strong> {new Date(hotel.createdAt || Date.now()).toDateString()}</div>
                <div><strong>Rating:</strong> {hotel.avgRating || "—"}</div>
              </div>
              <div className="booking-actions">
                <button className="btn-glow" onClick={() => document.querySelector('.uhp-rooms')?.scrollIntoView({ behavior: 'smooth' })}>See Rooms</button>
                <button className="btn-outline" onClick={() => navigate('/hotels')}>Back to Hotels</button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* floating booking panel */}
      <aside className={`uhp-panel ${panelOpen ? 'open' : ''}`} aria-hidden={!panelOpen}>
        {selectedRoom ? (
          <div className="panel-inner">
            <div className="panel-head">
              <h3>Room #{selectedRoom.roomNumber}</h3>
              <div className="panel-cat">{selectedRoom.category} • {selectedRoom.type}</div>
            </div>

            <div className="panel-body">
              <div className="panel-price">₹{selectedRoom.pricePerNight} / night</div>
              <div className="panel-desc">{selectedRoom.amenities?.slice(0,6).join(", ") || "No extra amenities listed."}</div>

              <div className="panel-actions">
                <button className="btn-glow" onClick={() => handleViewRoom(selectedRoom._id)}>View</button>
                <button className="btn-book" onClick={() => handleBookRoom(selectedRoom._id)}>Book Now</button>
              </div>
            </div>

            <button className="panel-close" onClick={() => { setPanelOpen(false); setSelectedRoom(null); }}>✕</button>
          </div>
        ) : (
          <div className="panel-empty">Select a room to see details</div>
        )}
      </aside>

      {/* footer */}
      <footer className="uhp-footer glass-lite">
        <div>© {new Date().getFullYear()} LuxStay</div>
        {/* <div className="footer-links">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </div> */}
      </footer>
    </div>
  );
}

/* helpers for navigation inside component */
function handleViewRoom(roomId) {
  // placeholder duplicate - actual navigation is declared inside component where navigate is available
}
