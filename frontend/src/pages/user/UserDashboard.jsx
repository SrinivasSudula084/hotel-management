import React, { useEffect, useMemo, useState } from "react";
import "./UserDashboard.css";
import api from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";

/**
 * UserDashboard.jsx
 * - Dark premium navbar (neon hover)
 * - Large full-width hero with gradient overlay + rotating quotes
 * - Glass sections for Regular / Deluxe / Suite (each has "More" to load more)
 * - Browse by location (search input), uses same HotelCard design
 * - Footer is glass-style
 *
 * Assumes /api/hotels returns hotels with populated `rooms` containing { category, pricePerNight }.
 */

export default function UserDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // per-category "visible count" state (for Load More)
  const [visible, setVisible] = useState({ regular: 4, deluxe: 4, suite: 4 });

  // location search
  const [locationQuery, setLocationQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    (async function load() {
      try {
        setLoading(true);
        const res = await api.get("/hotels?limit=500"); // get many so load-more works client-side
        if (!mounted) return;
        setHotels(res.data.hotels || []);
      } catch (err) {
        console.error("Failed to load hotels", err);
        setHotels([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  // categorize (hotel can be in multiple categories)
  const categorized = useMemo(() => {
    return {
      regular: hotels.filter((h) => h.rooms?.some((r) => r.category === "Regular")),
      deluxe: hotels.filter((h) => h.rooms?.some((r) => r.category === "Deluxe")),
      suite: hotels.filter((h) => h.rooms?.some((r) => r.category === "Suite")),
    };
  }, [hotels]);

  // location filtered hotels
  const hotelsByLocation = useMemo(() => {
    if (!locationQuery) return [];
    const q = locationQuery.toLowerCase().trim();
    return hotels.filter((h) => (h.location?.city || "").toLowerCase().includes(q));
  }, [hotels, locationQuery]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleLoadMore = (category) => {
    setVisible((v) => ({ ...v, [category]: (v[category] || 4) + 4 }));
  };

  return (
    <div className="ud-root">

      {/* NAVBAR (Dark Premium Nav with neon hover) */}
      <nav className="ud-nav">
        <div className="ud-nav-left">
          <div className="ud-logo">Lux<span>Stay</span></div>
          <div className="ud-slogan">Find the perfect stay</div>
        </div>

        <div className="ud-nav-right">
          <Link to="/user/dashboard" className="nav-link">Home</Link>
          <Link to="/hotels" className="nav-link">View Hotels</Link>
          <Link to="/my-bookings" className="nav-link">My Bookings</Link>
          <Link to="/login" className="nav-link" onClick={() => {
                    localStorage.removeItem("token");
    localStorage.removeItem("user");
                     navigate("/login");
                   }}>
                     Logout
                   </Link>

        </div>
      </nav>

      {/* HERO: Full-width image with gradient overlay + rotating quotes */}
      <header className="ud-hero">
        <div className="ud-hero-overlay">
          <div className="ud-hero-inner">
            <div className="ud-hero-text">
              <h1>Find your perfect stay</h1>

              <div className="quotes">
                <div className="quote">"Comfort meets class — stay like royalty."</div>
                <div className="quote">"Exceptional hospitality, unforgettable stays."</div>
                <div className="quote">"Your comfort is our mission."</div>
              </div>

              <p className="hero-sub">Browse curated hotels, real reviews and the best nightly prices.</p>

              <div className="hero-cta">
                <button className="btn-glow" onClick={() => navigate("/hotels")}>View Hotels</button>
                <button className="btn-outline" onClick={() => navigate("/my-bookings")}>My Bookings</button>
              </div>
            </div>

            <div className="ud-hero-card glass-lite">
              <div className="hero-card-title">Member perk</div>
              <div className="hero-card-sub">Exclusive rates & free cancellation</div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="ud-main container1">
        {/* Category sections */}
        <CategorySection
          title="Regular"
          hotels={categorized.regular}
          visibleCount={visible.regular}
          onLoadMore={() => handleLoadMore("regular")}
        />

        <CategorySection
          title="Deluxe"
          hotels={categorized.deluxe}
          visibleCount={visible.deluxe}
          onLoadMore={() => handleLoadMore("deluxe")}
        />

        <CategorySection
          title="Suite"
          hotels={categorized.suite}
          visibleCount={visible.suite}
          onLoadMore={() => handleLoadMore("suite")}
        />

        {/* Browse by location */}
        <section className="ud-section glass-lite">
          <div className="section-head">
            <h2>Browse by location</h2>
            <div className="location-actions">
              <input
                className="location-search"
                placeholder="Search city (e.g. Hyderabad)"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="card-grid">
            {loading ? (
              <div className="loading">Loading…</div>
            ) : locationQuery ? (
              hotelsByLocation.length === 0 ? (
                <div className="empty">No hotels found for “{locationQuery}”</div>
              ) : (
                hotelsByLocation.map((h) => <DashboardHotelCard key={h._id} hotel={h} />)
              )
            ) : (
              <div className="info">Type a city to search hotels by location.</div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER (Glass) */}
      <footer className="ud-footer glass-lite">
        <div>© {new Date().getFullYear()} LuxStay</div>
        <div className="footer-links">
          <Link to="/user/dashboard">Terms</Link>
          <Link to="/user/dashboard">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}

/* CategorySection shows first visibleCount hotels and a Load More button */
function CategorySection({ title, hotels = [], visibleCount = 4, onLoadMore }) {
  return (
    <section className="ud-section glass-lite">
      <div className="section-head">
        <h2>{title} Rooms</h2>
        <div className="section-actions">
          <button className="btn-more" onClick={onLoadMore}>More →</button>
        </div>
      </div>

      <div className="card-grid">
        {hotels.length === 0 ? (
          <div className="empty">No hotels in this category.</div>
        ) : (
          hotels.slice(0, visibleCount).map((h) => <DashboardHotelCard key={h._id} hotel={h} />)
        )}
      </div>
    </section>
  );
}

/* DashboardHotelCard uses the same card visuals as HotelsList card */
function DashboardHotelCard({ hotel }) {
  const navigate = useNavigate();
  const img = hotel.images?.[0] || "/placeholder.png";
  const minPrice = hotel.rooms?.length ? Math.min(...hotel.rooms.map((r) => r.pricePerNight)) : null;

  return (
    <article className="hotel-card">
      <div className="card-img-wrapper">
        <img src={img} alt={hotel.name} className="card-img" onError={(e) => (e.target.src = "/placeholder.png")} />
        {minPrice && <div className="price-tag">₹{minPrice}</div>}
      </div>

      <div className="card-body">
        <h3 className="hotel-title">{hotel.name}</h3>
        <p className="hotel-city">📍 {hotel.location?.city || "Unknown"}</p>

        <p className="hotel-desc">{hotel.description?.slice(0, 80) || "—"}{hotel.description?.length > 80 ? "..." : ""}</p>

        <div className="card-actions">
          <button className="view-btn" onClick={() => navigate(`/hotels/${hotel._id}`)}>View Details</button>
        </div>
      </div>
    </article>
  );
}
