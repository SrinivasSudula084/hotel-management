// src/pages/owner/OwnerAddRooms.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import "./OwnerAddRooms.css";

export default function OwnerAddRooms() {
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { hotelId } = useParams();

  // Fetch hotel details
  useEffect(() => {
    async function fetchHotel() {
      try {
        const res = await api.get(`/owner/hotels/${hotelId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHotel(res.data.hotel);
      } catch (err) {
        console.error(err);
        setError("Failed to load hotel");
      }
    }
    fetchHotel();
  }, [hotelId, token]);

  const closePortal = () => navigate(`/owner/hotel/${hotelId}`);

  // Add a room row
  const addRoomRow = () => {
    setRooms((prev) => [
      ...prev,
      {
        roomNumber: "",
        category: "Regular",
        type: "single",
        maxGuests: "",
        pricePerNight: "",
      },
    ]);
  };

  // Handle change
  const handleChange = (index, key, value) => {
    const updated = [...rooms];
    updated[index][key] = value;
    setRooms(updated);
  };

  // Submit rooms
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rooms.length === 0) {
      setError("Please add at least one room");
      return;
    }

    try {
      await api.post(
        `/owner/hotels/${hotelId}/rooms`,
        { rooms },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Rooms added successfully!");
      navigate(`/owner/hotel/${hotelId}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add rooms");
    }
  };

  if (!hotel) return <p className="loading">Loading...</p>;

  return (
    <div className="add-room-portal">

      {/* OVERLAY */}
      <div className="portal-overlay" onClick={closePortal}></div>

      {/* MODAL */}
      <div className="portal-modal">

        {/* Close Button */}
        <button className="close-btn" onClick={closePortal}>✖</button>

        <h2 className="portal-title">Add Rooms to {hotel.name}</h2>

        {error && <p className="error-text">{error}</p>}

        <button className="add-row-btn" onClick={addRoomRow}>➕ Add Room</button>

        <form onSubmit={handleSubmit} className="rooms-form">

          {rooms.map((room, index) => (
            <div key={index} className="room-row">
              <h4 className="room-row-title">Room {index + 1}</h4>

              <input
                className="room-input"
                type="text"
                placeholder="Room Number"
                value={room.roomNumber}
                onChange={(e) => handleChange(index, "roomNumber", e.target.value)}
              />

              <select
                className="room-select"
                value={room.category}
                onChange={(e) => handleChange(index, "category", e.target.value)}
              >
                <option>Regular</option>
                <option>Deluxe</option>
                <option>Suite</option>
              </select>

              <select
                className="room-select"
                value={room.type}
                onChange={(e) => handleChange(index, "type", e.target.value)}
              >
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
                <option value="quadruple">Quadruple</option>
              </select>

              <input
                className="room-input"
                type="number"
                placeholder="Max Guests"
                value={room.maxGuests}
                onChange={(e) => handleChange(index, "maxGuests", e.target.value)}
              />

              <input
                className="room-input"
                type="number"
                placeholder="Price Per Night"
                value={room.pricePerNight}
                onChange={(e) => handleChange(index, "pricePerNight", e.target.value)}
              />
            </div>
          ))}

          <button type="submit" className="save-btn">Save Rooms</button>
        </form>
      </div>
    </div>
  );
}
