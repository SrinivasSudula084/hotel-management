// src/pages/user/MyBookingsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./MyBookingsPage.css";
import Navbar from "../../components/Navbar.jsx";
export default function MyBookingsPage() {
  const navigate = useNavigate();

  // raw bookings from server
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [openBooking, setOpenBooking] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterText, setFilterText] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // success animation state for cancel
  const [animBookingId, setAnimBookingId] = useState(null);

  // cache for hotels when booking.hotel is only an id OR missing images
  const [hotelCache, setHotelCache] = useState({}); // { hotelId: hotelObject }

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await api.get("/bookings/my", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!mounted) return;
        const data = res.data.bookings || [];
        setBookings(data);

        // collect hotel ids that need fetching:
        const needFetch = new Set();
        data.forEach((b) => {
          const h = b.hotel;
          // cases: hotel populated object with images -> ok
          // if hotel is a string id OR object without images -> fetch
          if (!h) return;
          if (typeof h === "string") needFetch.add(h);
          else if (typeof h === "object" && (!h.images || h.images.length === 0)) {
            // if it has an _id, try to fetch the full hotel just in case
            if (h._id) needFetch.add(h._id);
          }
        });

        if (needFetch.size > 0) {
          // fetch details in parallel, update cache
          const promises = Array.from(needFetch).map(async (id) => {
            try {
              const r = await api.get(`/hotels/${id}`);
              return { id, hotel: r.data.hotel };
            } catch (err) {
              // ignore fetch failures for single hotels
              return { id, hotel: null };
            }
          });

          const results = await Promise.all(promises);
          if (!mounted) return;
          setHotelCache((pc) => {
            const next = { ...pc };
            for (const row of results) {
              if (row.hotel) next[row.id] = row.hotel;
            }
            return next;
          });
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load bookings");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  // helper to resolve a usable image URL for a booking
  const resolveBookingImage = (b) => {
    // 1) booking.hotel may be populated object with images
    if (b?.hotel) {
      if (typeof b.hotel === "object") {
        if (Array.isArray(b.hotel.images) && b.hotel.images.length > 0) return b.hotel.images[0];
        // some APIs use 'image' singular
        if (b.hotel.image) return b.hotel.image;
      } else if (typeof b.hotel === "string") {
        // hotel is an id string -> check cache
        const cached = hotelCache[b.hotel];
        if (cached?.images && cached.images.length > 0) return cached.images[0];
        if (cached?.image) return cached.image;
      }
    }

    // 2) server might return hotelId property instead
    if (b?.hotelId && hotelCache[b.hotelId]) {
      const c = hotelCache[b.hotelId];
      if (Array.isArray(c.images) && c.images.length > 0) return c.images[0];
      if (c.image) return c.image;
    }

    // 3) sometimes server populates hotel as { _id:..., images: [...] } but our earlier fetch added to cache keyed by id
    if (b?.hotel && b.hotel._id && hotelCache[b.hotel._id]) {
      const c = hotelCache[b.hotel._id];
      if (Array.isArray(c.images) && c.images.length > 0) return c.images[0];
    }

    // 4) fallback: if booking has `thumbnail` or `photo`
    if (b?.thumbnail) return b.thumbnail;
    if (b?.photo) return b.photo;

    // 5) ultimate fallback: placeholder
    return "/placeholder.png";
  };

  // helper: compute nights if backend didn't supply (and produce label)
  const computeNightsFromDates = (checkIn, checkOut) => {
    try {
      const s = new Date(checkIn);
      const e = new Date(checkOut);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
      // same day => 0.5
      if (s.getFullYear() === e.getFullYear() &&
          s.getMonth() === e.getMonth() &&
          s.getDate() === e.getDate()) {
        return 0.5;
      }
      const diff = (e - s) / (1000 * 60 * 60 * 24);
      return diff > 0 ? Math.ceil(diff) : 0;
    } catch (err) {
      return 0;
    }
  };

  const formatNights = (booking) => {
    const raw = booking?.nights;
    const n = Number(raw ?? computeNightsFromDates(booking.checkIn, booking.checkOut));
    if (n === 0.5) return "0.5 Night • Day Use";
    if (n === 1) return "1 Night";
    if (n > 1) return `${n} Nights`;
    return "—";
  };

  // Filtering logic (client-side)
  const filtered = useMemo(() => {
    let list = [...bookings];

    if (filterStatus !== "all") {
      list = list.filter((b) => (b.status || "").toLowerCase() === filterStatus);
    }
    if (filterText.trim()) {
      const q = filterText.trim().toLowerCase();
      list = list.filter(
        (b) =>
          (b.hotel?.name || "").toLowerCase().includes(q) ||
          (b.room?.category || "").toLowerCase().includes(q) ||
          (b.room?.roomNumber || "").toString().includes(q)
      );
    }
    if (filterFrom) {
      const fromDate = new Date(filterFrom);
      list = list.filter((b) => new Date(b.checkIn) >= fromDate);
    }
    if (filterTo) {
      const toDate = new Date(filterTo);
      list = list.filter((b) => new Date(b.checkOut) <= toDate);
    }
    return list;
  }, [bookings, filterStatus, filterText, filterFrom, filterTo]);

  // pagination slice
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // Cancel booking (with animation)
  const cancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await api.put(`/bookings/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // optimistic update
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b))
      );

      // trigger success animation on card/modal
      setAnimBookingId(id);
      setTimeout(() => setAnimBookingId(null), 1800);

      // close modal if open
      setOpenBooking((prev) => (prev && prev._id === id ? null : prev));
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to cancel booking");
    }
  };

  if (loading) return <div className="mb-loading">Loading...</div>;

  return (
    <>
      <Navbar />

      {/* PAGE */}
      <div className="mb-container">
        <div className="mb-topbar">
          <h2 className="mb-title">My Bookings</h2>

          {/* FILTERS */}
          <div className="mb-filters">
            <input
              type="text"
              placeholder="Search hotel, room, number..."
              value={filterText}
              onChange={(e) => { setFilterText(e.target.value); setPage(1); }}
              className="mb-filter-input"
            />

            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="mb-filter-select"
            >
              <option value="all">All statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <input
              type="date"
              className="mb-filter-date"
              value={filterFrom}
              onChange={(e) => { setFilterFrom(e.target.value); setPage(1); }}
            />
            <input
              type="date"
              className="mb-filter-date"
              value={filterTo}
              onChange={(e) => { setFilterTo(e.target.value); setPage(1); }}
            />

            <div className="mb-pagination-controls">
              <label>Per page:</label>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
              </select>
            </div>
          </div>
        </div>

        {/* GRID */}
        {filtered.length === 0 ? (
          <p className="mb-empty">No bookings match your filters.</p>
        ) : (
          <div className="mb-grid">
            {pageItems.map((b) => (
              <div
                key={b._id}
                className="mb-card"
                onClick={() => setOpenBooking(b)}
              >
                <div className="mb-card-left">
                  <img
                    src={resolveBookingImage(b)}
                    alt={b.hotel?.name || "hotel"}
                    onError={(e) => (e.target.src = "/placeholder.png")}
                  />
                </div>

                <div className="mb-card-right">
                  <div className="mb-hotel-name">{b.hotel?.name || (hotelCache[b.hotel]?.name) || "Hotel"}</div>
                  <div className="mb-room">{`Room #${b.room?.roomNumber || "—"} • ${b.room?.category || "—"}`}</div>
                  <div className="mb-dates">
                    {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}
                  </div>

                  {/* nights label */}
                  <div className="mb-nights">{formatNights(b)}</div>

                  <div className="mb-row-bottom">
                    <div className="mb-price">₹{b.totalPrice}</div>

                    <span className={`mb-status ${b.status === "confirmed" ? "st-confirmed" : b.status === "cancelled" ? "st-cancelled" : "st-pending"}`}>
                      {b.status?.toUpperCase() || "UNKNOWN"}
                    </span>
                  </div>
                </div>

                {/* animation overlay */}
                {animBookingId === b._id && (
                  <div className="mb-anim-overlay">
                    <div className="mb-tick-circle">
                      <div className="mb-tick" />
                    </div>
                    <div className="mb-anim-text">Cancelled</div>
                    <div className="mb-confetti">
                      <span className="c1" /><span className="c2" /><span className="c3" />
                      <span className="c4" /><span className="c5" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        <div className="mb-pager">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
          <div className="mb-page-info">Page {page} / {totalPages}</div>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
        </div>
      </div>

      {/* MODAL */}
      {openBooking && (
        <div className="mb-modal-overlay" onClick={() => setOpenBooking(null)}>
          <div className="mb-modal" onClick={(e) => e.stopPropagation()}>
            <button className="mb-close" onClick={() => setOpenBooking(null)}>✕</button>

            <img
              className="mb-modal-img"
              src={resolveBookingImage(openBooking)}
              alt={openBooking.hotel?.name || "hotel"}
              onError={(e) => (e.target.src = "/placeholder.png")}
            />

            <h2 className="mb-modal-title">{openBooking.hotel?.name || hotelCache[openBooking.hotel]?.name || "Hotel"}</h2>
            <p className="mb-location">{openBooking.hotel?.location?.city || hotelCache[openBooking.hotel]?.location?.city || openBooking.hotel?.location?.address}</p>

            <div className="mb-modal-info">
              <p><b>Room:</b> #{openBooking.room?.roomNumber || "—"}</p>
              <p><b>Type:</b> {openBooking.room?.category || "—"} • {openBooking.room?.type || "—"}</p>
              <p><b>Dates:</b> {new Date(openBooking.checkIn).toLocaleDateString()} → {new Date(openBooking.checkOut).toLocaleDateString()}</p>
              <p><b>Nights:</b> {formatNights(openBooking)}</p>
              <p><b>Total:</b> ₹{openBooking.totalPrice} {Number(openBooking.nights ?? computeNightsFromDates(openBooking.checkIn, openBooking.checkOut)) === 0.5 && <span>(Half Day Rate)</span>}</p>
              <p><b>Status:</b> {openBooking.status}</p>
            </div>

            {openBooking.status !== "cancelled" ? (
              <button className="mb-cancel-btn" onClick={() => cancelBooking(openBooking._id)}>
                Cancel Booking
              </button>
            ) : (
              <div className="mb-cancelled-note">This booking is cancelled.</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
