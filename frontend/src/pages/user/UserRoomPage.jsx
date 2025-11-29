// src/pages/user/UserRoomPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import RoomCalendar from "../../components/RoomCalendar";
import "./UserRoomPage.css";

export default function UserRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [hotelBookings, setHotelBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRange, setSelectedRange] = useState({
    startDate: null,
    endDate: null,
  });

  // ✅ convert JS Date → yyyy-mm-dd (local)
  function toDateInputString(d) {
    if (!d) return null;
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  useEffect(() => {
    async function load() {
      try {
        const r = await api.get(`/rooms/${roomId}`);
        setRoom(r.data.room);

        const hotelId = r.data.room.hotel._id || r.data.room.hotel;
        const b = await api.get(`/hotels/${hotelId}/bookings`);
        setHotelBookings(b.data.bookings || []);
      } catch (err) {
        console.error(err);
        alert("Failed to load room details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [roomId]);

  const bookingsForRoom = useMemo(() => {
    if (!room) return [];
    return hotelBookings
      .filter((b) => String(b.room) === String(room._id))
      .map((b) => ({
        start: b.checkIn,
        end: b.checkOut,
      }));
  }, [hotelBookings, room]);

  // ✅ FIXED — safe local-date conversion
  const onSelect = (sel) => {
    setSelectedRange({
      startDate: toDateInputString(sel.startDate),
      endDate: toDateInputString(sel.endDate),
    });
  };

  const onConfirm = () => {
    if (!selectedRange.startDate || !selectedRange.endDate)
      return alert("Select check-in and check-out");

    navigate(`/book/${room._id}`, {
      state: {
        checkIn: selectedRange.startDate,
        checkOut: selectedRange.endDate,
      },
    });
  };

  if (loading) return <div className="urp-loading">Loading…</div>;
  if (!room) return <div className="urp-loading">Room not found</div>;

  const hotel = room.hotel;
  const bannerImg = hotel.images?.[0] || "/placeholder.png";

  return (
    <div className="urp-root">
      {/* TOP BANNER */}
      <div className="urp-banner">
        <img
          src={bannerImg}
          alt="Hotel Banner"
          className="urp-banner-img"
          onError={(e) => (e.target.src = "/placeholder.png")}
        />
        <div className="urp-banner-overlay">
          <h1>Room #{room.roomNumber}</h1>
          <p>
            {room.category} • {room.type}
          </p>
        </div>
      </div>

      <div className="urp-content">
        {/* HOTEL INFO */}
        <div className="urp-box">
          <h2 className="urp-title">Hotel Details</h2>
          <p className="urp-hotel-name">{hotel.name}</p>
          <p className="urp-location">
            📍 {hotel.location?.city}, {hotel.location?.state}
          </p>
          <p className="urp-desc">{hotel.description}</p>
        </div>

        {/* ROOM INFO */}
        <div className="urp-box">
          <h2 className="urp-title">Room Details</h2>
          <div className="urp-roominfo">
            <div className="urp-badge">{room.category}</div>
            <div className="urp-badge type">{room.type}</div>
          </div>

          <p className="urp-price">₹{room.pricePerNight} / night</p>
        </div>

        {/* CALENDAR */}
        <div className="urp-box">
          <h2 className="urp-title">Select Dates</h2>

          <RoomCalendar bookedRanges={bookingsForRoom} onSelect={onSelect} />

          <div className="urp-selected">
            <p>
              <b>Selected:</b>{" "}
              {selectedRange.startDate || "-"} → {selectedRange.endDate || "-"}
            </p>
          </div>

          <div className="urp-actions">
            <button className="urp-confirm" onClick={onConfirm}>
              Continue to Book →
            </button>
            <button
              className="urp-clear"
              onClick={() =>
                setSelectedRange({ startDate: null, endDate: null })
              }
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
