// src/pages/owner/OwnerHotelPage.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Navbar from "../../components/Navbar1";
import { useParams, useNavigate } from "react-router-dom";
import "./OwnerHotelPage.css";

export default function OwnerHotelPage() {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [hotel, setHotel] = useState(null);
  const [bookedRooms, setBookedRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadHotel() {
    try {
      const hotelRes = await api.get(`/owner/hotels/${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setHotel(hotelRes.data.hotel);

      const bookedRes = await api.get(`/owner/hotels/${hotelId}/booked-rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBookedRooms(bookedRes.data.bookedRoomIds);
    } catch (err) {
      console.error(err);
      alert("Failed to load hotel data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHotel();
  }, [hotelId]);

  /* ===========================
      DELETE HOTEL
  ============================ */
  const handleDeleteHotel = async () => {
    if (!window.confirm("Delete this hotel? All rooms and bookings will also be deleted.")) return;

    try {
      await api.delete(`/owner/hotels/${hotelId}`);
      alert("Hotel deleted successfully!");
      navigate("/owner/hotels");
    } catch (err) {
      console.error(err);
      alert("Failed to delete hotel.");
    }
  };

  /* ===========================
      DELETE ROOM
  ============================ */
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Delete this room? This cannot be undone.")) return;

    try {
      await api.delete(`/owner/hotels/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Room deleted successfully!");
      loadHotel(); // refresh UI
    } catch (err) {
      console.error(err);
      alert("Failed to delete room.");
    }
  };

  if (loading) return <p className="loading-text">Loading hotel...</p>;
  if (!hotel) return <p className="loading-text">Hotel not found</p>;

  /* ===========================
      FIXED IMAGE HANDLING
  ============================ */
  const rawImg = hotel.images?.[0];

  const bannerImg = rawImg
    ? rawImg.startsWith("http")
      ? rawImg
      : `${import.meta.env.VITE_BACKEND_URL}/${rawImg}`
    : "https://cdn-icons-png.flaticon.com/512/2748/2748558.png";

  return (
    <div className="hotel-page">
      <Navbar />

      {/* Banner Section */}
      <div className="hotel-banner">
        <img
          src={bannerImg}
          alt="hotel"
          className="hotel-banner-img"
        />

        <div className="hotel-banner-overlay">
          <h2 className="hotel-title">{hotel.name}</h2>
          <p className="hotel-description">{hotel.description}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="hotel-actions">
        <button
          className="btn gold-btn"
          onClick={() => navigate(`/owner/hotel/${hotelId}/add-rooms`)}
        >
          ➕ Add Rooms
        </button>

        <button
          className="btn edit-btn"
          onClick={() => navigate(`/owner/hotel/${hotelId}/edit`)}
        >
          ✏️ Edit Hotel
        </button>

        <button className="btn delete-btn" onClick={handleDeleteHotel}>
          🗑 Delete Hotel
        </button>
      </div>

      {/* Rooms Section */}
      <h3 className="rooms-title">Rooms</h3>

      <div className="rooms-grid">
        {hotel.rooms?.length > 0 ? (
          hotel.rooms.map((room) => {
            const isBooked = bookedRooms.includes(room._id);

            return (
              <div key={room._id} className="room-card">
                <p className="room-info">
                  <strong>Room #{room.roomNumber}</strong>
                </p>
                <p className="room-type">
                  {room.category} • {room.type}
                </p>
                <p className="room-price">₹{room.pricePerNight}</p>

                {isBooked && <span className="booked-badge">BOOKED</span>}

                <button
                  className="btn room-btn"
                  onClick={() => navigate(`/owner/room/${room._id}/calendar`)}
                >
                  📅 View Calendar
                </button>

                {!isBooked && (
                  <button
                    className="btn room-delete-btn"
                    onClick={() => handleDeleteRoom(room._id)}
                  >
                    ❌ Delete Room
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <p className="empty-text">No rooms added yet</p>
        )}
      </div>
    </div>
  );
}
