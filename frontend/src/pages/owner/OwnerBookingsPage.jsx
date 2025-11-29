// src/pages/owner/OwnerBookingsPage.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Navbar1 from "../../components/Navbar1";
import "./OwnerBookingsPage.css";

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/owner/hotels/bookings/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setBookings(res.data.bookings || []);
        console.log("OWNER BOOKINGS:", res.data.bookings);
      } catch (err) {
        console.error(err);
        alert("Failed to load bookings");
      }
      setLoading(false);
    }
    load();
  }, []);
  
  if (loading) return <p className="ob-loading">Loading bookings…</p>;

  return (
    <div className="ob-page">

      {/* Navbar */}
      <Navbar1 />

      <h2 className="ob-title">All Bookings</h2>

      {bookings.length === 0 ? (
        <p className="ob-empty">No bookings yet.</p>
      ) : (
        <div className="ob-grid">
          {bookings.map((b) => {
            const hotelImg = b.hotel?.images?.[0] || "/placeholder.png";
            return (
              <div
                key={b._id}
                className="ob-card"
                onClick={() => setSelectedBooking(b)}
              >
                <img
                  src={hotelImg}
                  alt="hotel"
                  className="ob-img"
                  onError={(e) => (e.target.src = "/placeholder.png")}
                />

                <div className="ob-card-body">
                  <h3 className="ob-hotel">{b.hotel?.name}</h3>
                  <p className="ob-room">Room #{b.room?.roomNumber} • {b.room?.type}</p>

                  <p className="ob-date">
                    {new Date(b.checkIn).toDateString()} →{" "}
                    {new Date(b.checkOut).toDateString()}
                  </p>

                  <span className={`ob-status ${b.status}`}>
                    {b.status.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BOOKING DETAILS MODAL */}
      {selectedBooking && (
        <div className="ob-modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="ob-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ob-close" onClick={() => setSelectedBooking(null)}>✖</button>

            <h3 className="ob-modal-title">Booking Details</h3>

            <p><b>Hotel:</b> {selectedBooking.hotel?.name}</p>
            <p><b>Room:</b> #{selectedBooking.room?.roomNumber} ({selectedBooking.room?.type})</p>

            <p><b>User:</b> {selectedBooking.user?.name}</p>
            <p><b>Email:</b> {selectedBooking.user?.email}</p>

            <p><b>Check-in:</b> {new Date(selectedBooking.checkIn).toDateString()}</p>
            <p><b>Check-out:</b> {new Date(selectedBooking.checkOut).toDateString()}</p>

            <p><b>Nights:</b> {selectedBooking.nights}</p>
            <p><b>Total Price:</b> ₹{selectedBooking.totalPrice}</p>

            <p>
              <b>Status:</b>{" "}
              <span className={`ob-status ${selectedBooking.status}`}>
                {selectedBooking.status.toUpperCase()}
              </span>
            </p>
            
          </div>
        </div>
      )}
    </div>
  );
}
