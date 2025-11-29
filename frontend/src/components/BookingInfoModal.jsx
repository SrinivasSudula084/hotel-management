import React from "react";

export default function BookingInfoModal({ open, onClose, booking }) {
  if (!open) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Booking Details</h3>

        <p><b>Booked By:</b> {booking.userName}</p>
        <p><b>Email:</b> {booking.userEmail}</p>
        <p><b>Check-in:</b> {booking.start}</p>
        <p><b>Check-out:</b> {booking.end}</p>
        <p><b>Price/Night:</b> ₹{booking.pricePerNight}</p>
        <p><b>Total Price:</b> ₹{booking.totalPrice}</p>

        <button onClick={onClose} style={styles.btn}>Close</button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: 10,
    width: "320px"
  },
  btn: {
    marginTop: 16,
    width: "100%",
    padding: "10px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  }
};
