// src/pages/user/BookRoom.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import "./BookRoom.css";

export default function BookRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Prefilled dates from navigation
  const initialCheckIn = location.state?.checkIn || "";
  const initialCheckOut = location.state?.checkOut || "";

  const [room, setRoom] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);

  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  // Fetch room from backend and ensure hotel is a full object
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await api.get(`/rooms/${roomId}`);
        if (!mounted) return;

        const r = res.data.room;
        setRoom(r);

        // r.hotel may be an object (populated) or an id string
        if (r?.hotel && typeof r.hotel === "object") {
          setHotel(r.hotel);
        } else if (r?.hotel) {
          // fetch hotel by id
          try {
            const hr = await api.get(`/hotels/${r.hotel}`);
            if (!mounted) return;
            setHotel(hr.data.hotel);
          } catch (err) {
            // if hotel fetch fails, still proceed with hotel null
            console.warn("Failed to fetch hotel details:", err);
            setHotel(null);
          }
        } else {
          setHotel(null);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load room details.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();

    return () => (mounted = false);
  }, [roomId]);

  // Nights calculation: same-day => 0.5, otherwise difference in days (positive)
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;

    const s = new Date(checkIn);
    const e = new Date(checkOut);

    // If dates are invalid
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;

    // SAME DAY → HALF NIGHT
    if (
      s.getFullYear() === e.getFullYear() &&
      s.getMonth() === e.getMonth() &&
      s.getDate() === e.getDate()
    ) {
      return 0.5;
    }

    const diff = (e - s) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.ceil(diff) : 0;
  }, [checkIn, checkOut]);

  const pricePerNight = room?.pricePerNight || 0;
  const subtotal = Math.round(nights * pricePerNight); // round to integer rupees
  const taxes = Math.round(subtotal * 0.12);
  const fees = Math.round(subtotal * 0.03);
  const total = subtotal + taxes + fees;

  const confirmBooking = async () => {
    try {
      if (nights <= 0) return setError("Select valid dates.");

      setError("");
      setProcessing(true);

      await api.post(
        "/bookings",
        {
          hotelId: hotel?._id || hotel, // support both populated object or id
          category: room.category,
          type: room.type,
          checkIn,
          checkOut,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setProcessing(false);
      setConfirmed(true);

      setTimeout(() => navigate("/my-bookings"), 1400);
    } catch (err) {
      console.error(err);
      setProcessing(false);
      setError(err?.response?.data?.message || "Booking failed.");
    }
  };

  if (loading) return <div className="br-loading">Loading…</div>;
  if (!room) return <div className="br-error">Room not found</div>;

  const nightsLabel = nights === 0.5 ? "0.5 night (Day Use)" : `${nights} night${nights > 1 ? "s" : ""}`;

  return (
    <div className="br-page">
      <div className="br-container">
        {/* LEFT IMAGE SECTION */}
        <div className="br-left">
          <div className="br-img-box">
            <img
              src={hotel?.images?.[0] || "/placeholder.png"}
              alt="hotel"
              onError={(e) => (e.target.src = "/placeholder.png")}
            />
            <div className="br-img-overlay">
              <div className="br-img-title">{hotel?.name || "Hotel"}</div>
              <div className="br-img-sub">{hotel?.location?.city || ""}</div>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT SECTION */}
        <div className="br-right">
          <h2 className="br-room-title">Room #{room.roomNumber}</h2>

          <div className="br-room-type">{room.category} • {room.type}</div>

          <div className="br-price-block">
            <div className="br-price">₹{pricePerNight}</div>
            <div className="br-per-night">/ night</div>
          </div>

          {/* DATE INPUT */}
          <div className="br-dates">
            <div>
              <label className="br-label">Check-in</label>
              <input
                type="date"
                className="br-input"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>

            <div>
              <label className="br-label">Check-out</label>
              <input
                type="date"
                className="br-input"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>

          {/* SUMMARY */}
          <div className="br-summary">
            <div className="br-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="br-row small">
              <span>Taxes</span>
              <span>₹{taxes}</span>
            </div>
            <div className="br-row small">
              <span>Fees</span>
              <span>₹{fees}</span>
            </div>
            <div className="br-row total">
              <span>Total ({nightsLabel})</span>
              <span>₹{total}</span>
            </div>
          </div>

          {error && <div className="br-err-box">{error}</div>}

          <button
            className={`br-confirm-btn ${processing ? "processing" : ""}`}
            onClick={confirmBooking}
          >
            {processing ? "Processing…" : "Confirm Booking"}
          </button>

          {confirmed && (
            <div className="br-success">
              <div className="br-tick" />
              <p>Booking Confirmed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
