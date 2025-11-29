// src/pages/owner/OwnerRoomCalendarPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./OwnerRoomCalendarPage.css";

const PREDEFINED_REASONS = [
  { key: "guest_request", label: "Guest request" },
  { key: "failed_payment", label: "Failed payment" },
  { key: "overbooking", label: "Overbooking" },
  { key: "owner_emergency", label: "Owner emergency" },
  { key: "maintenance", label: "Maintenance issue" },
  { key: "other", label: "Other" }
];

export default function OwnerRoomCalendarPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [bookings, setBookings] = useState([]);
  const [month, setMonth] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [hoverBooking, setHoverBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transitionDir, setTransitionDir] = useState("");
  const [cancelReasonKey, setCancelReasonKey] = useState("guest_request");
  const [cancelReasonOther, setCancelReasonOther] = useState("");

  useEffect(() => {
    loadCalendar();
  }, [roomId]);

  async function loadCalendar() {
    setLoading(true);
    try {
      const res = await api.get(`/owner/hotels/room/${roomId}/calendar`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ⭐ FILTER OUT CANCELED BOOKINGS
      const activeBookings = (res.data.bookings || []).filter(
        b => b.status !== "cancelled"
      );

      setBookings(activeBookings);

    } catch (err) {
      console.error("Failed to load calendar:", err);
      alert("Failed to load room calendar");
    } finally {
      setLoading(false);
    }
  }

  /* ---------- FIND BOOKING FOR A DATE ---------- */
  function getBookingForDate(date) {
    return bookings.find((b) => {
      const start = new Date(b.checkIn);
      const end = new Date(b.checkOut);

      // Same day booking
      if (start.toDateString() === end.toDateString()) {
        return date.toDateString() === start.toDateString();
      }

      return date >= start && date < end;
    });
  }

  const goPrevMonth = () => {
    setTransitionDir("left");
    setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setTransitionDir("right");
    setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));
  };

  if (loading) return <p className="orc-loading">Loading calendar…</p>;

  /* ---------- BUILD CALENDAR ---------- */
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDay = new Date(year, monthIndex, 1).getDay();

  let daysArray = [];
  for (let i = 0; i < firstDay; i++) daysArray.push(null);
  for (let d = 1; d <= daysInMonth; d++) daysArray.push(d);

  /* ---------- CANCEL BOOKING ---------- */
  async function cancelBooking() {
    if (!selectedBooking) return;

    const now = new Date();
    if (new Date(selectedBooking.checkOut) < now) {
      alert("Cannot cancel past bookings.");
      return;
    }

    const confirmCancel = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmCancel) return;

    try {
      await api.put(
        `/owner/hotels/bookings/${selectedBooking.bookingId}/cancel`,
        {
          reasonKey: cancelReasonKey,
          reasonOther: cancelReasonOther,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Booking cancelled successfully!");

      await loadCalendar(); // refresh
      setSelectedBooking(null);

    } catch (err) {
      console.error(err);
      alert("Failed to cancel booking");
    }
  }

  const closePortal = () => navigate(-1);

  return (
    <div className="orc-portal">
      <div className="orc-overlay" onClick={closePortal}></div>

      <div className="orc-modal">

        <button className="orc-close" onClick={closePortal}>✖</button>

        <h2 className="orc-title">Room Calendar</h2>

        <div className="orc-monthbar">
          <button className="orc-month-btn" onClick={goPrevMonth}>◀</button>
          <h3>{month.toLocaleString("default", { month: "long" })} {year}</h3>
          <button className="orc-month-btn" onClick={goNextMonth}>▶</button>
        </div>

        {/* Calendar Grid */}
        <div className={`orc-grid animate-${transitionDir}`}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
            <div key={w} className="orc-weekday">{w}</div>
          ))}

          {daysArray.map((day, idx) => {
            if (!day) return <div key={idx} className="orc-empty"></div>;

            const date = new Date(year, monthIndex, day);
            const booking = getBookingForDate(date);
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <div
                key={idx}
                className={`orc-day ${booking ? "orc-day-booked" : ""} ${isPast ? "orc-disabled" : ""}`}
                onClick={() => booking && setSelectedBooking(booking)}
                onMouseEnter={() => booking && setHoverBooking({ booking, date })}
                onMouseLeave={() => setHoverBooking(null)}
              >
                <strong>{day}</strong>
              </div>
            );
          })}
        </div>

        {/* Tooltip */}
        {hoverBooking && (
          <div className="orc-tooltip">
            <b>{hoverBooking.booking.userName}</b><br />
            {new Date(hoverBooking.booking.checkIn).toDateString()} →{" "}
            {new Date(hoverBooking.booking.checkOut).toDateString()}
          </div>
        )}

        {/* Booking Modal */}
        {selectedBooking && (
          <div className="orc-booking-modal-overlay" onClick={() => setSelectedBooking(null)}>
            <div className="orc-booking-modal" onClick={(e) => e.stopPropagation()}>

              <button className="orc-booking-close" onClick={() => setSelectedBooking(null)}>✖</button>

              <h3>Booking Details</h3>

              <p><b>User:</b> {selectedBooking.userName}</p>
              <p><b>Email:</b> {selectedBooking.userEmail}</p>
              <p><b>Check-in:</b> {new Date(selectedBooking.checkIn).toDateString()}</p>
              <p><b>Check-out:</b> {new Date(selectedBooking.checkOut).toDateString()}</p>
              <p><b>Price/night:</b> ₹{selectedBooking.pricePerNight}</p>
              <p><b>Total:</b> ₹{selectedBooking.totalPrice}</p>

              <h4 style={{ marginTop: "10px" }}>Cancellation Reason</h4>

              <select
                className="cancel-select"
                value={cancelReasonKey}
                onChange={(e) => setCancelReasonKey(e.target.value)}
              >
                {PREDEFINED_REASONS.map((r) => (
                  <option key={r.key} value={r.key}>{r.label}</option>
                ))}
              </select>

              {cancelReasonKey === "other" && (
                <textarea
                  className="cancel-other-input"
                  placeholder="Enter reason..."
                  value={cancelReasonOther}
                  onChange={(e) => setCancelReasonOther(e.target.value)}
                />
              )}

              <button className="orc-cancel-btn" onClick={cancelBooking}>
                ❌ Cancel Booking
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
