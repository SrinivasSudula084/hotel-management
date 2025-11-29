import express from "express";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";

const router = express.Router();

/**
 * GET /api/hotels
 * Returns ONLY approved hotels for users
 */
router.get("/", async (req, res) => {
  try {
    const { city, category, type, from, to, page = 1, limit = 12 } = req.query;
    const filter = { approved: true }; // ⭐ HIDE UNAPPROVED HOTELS

    if (city) filter["location.city"] = city;

   const hotels = await Hotel.find(filter)
  .populate("rooms", "category pricePerNight")
  .skip((page - 1) * limit)
  .limit(Number(limit))
  .lean();


    // availability
    let availabilityMap = {};
    if (from && to && category && type) {
      const checkIn = new Date(from);
      const checkOut = new Date(to);

      const hotelIds = hotels.map(h => h._id);
      const rooms = await Room.find({ hotel: { $in: hotelIds }, category, type }).lean();

      const byHotel = {};
      rooms.forEach(r => {
        byHotel[r.hotel] = byHotel[r.hotel] || [];
        byHotel[r.hotel].push(r._id);
      });

      const roomIds = rooms.map(r => r._id);
      const overlapping = await Booking.find({
        room: { $in: roomIds },
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn }
      }).lean();

      const bookedByRoom = {};
      overlapping.forEach(b => (bookedByRoom[b.room.toString()] = true));

      hotels.forEach(h => {
        const rids = byHotel[h._id] || [];
        const freeCount = rids.filter(id => !bookedByRoom[id.toString()]).length;
        availabilityMap[h._id.toString()] = freeCount;
      });
    }

    const result = hotels.map(h => ({
      ...h,
      availableCount: availabilityMap[h._id.toString()] ?? null
    }));

    res.json({ hotels: result });

  } catch (err) {
    console.error("Hotel list error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/**
 * GET /api/hotels/:hotelId
 * Block details for unapproved hotels
 */
router.get("/:hotelId", async (req, res) => {
  try {
    const { hotelId } = req.params;

    const hotel = await Hotel.findById(hotelId).populate("rooms");

    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    if (!hotel.approved) {
      return res.status(403).json({ message: "This hotel is not approved yet." });
    }

    const activeBookings = await Booking.find({
      hotel: hotelId,
      status: "confirmed",
    }).select("room");

    const bookedRoomIds = activeBookings.map(b => b.room.toString());

    res.json({ hotel, bookedRoomIds });

  } catch (err) {
    console.error("Hotel details error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/**
 * GET /api/hotels/:hotelId/bookings
 */
router.get("/:hotelId/bookings", async (req, res) => {
  try {
    const { hotelId } = req.params;

    const bookings = await Booking.find({
      hotel: hotelId,
      status: "confirmed",
    }).select("room checkIn checkOut").lean();

    const result = bookings.map(b => ({
      room: b.room.toString(),
      checkIn: b.checkIn.toISOString().slice(0, 10),
      checkOut: b.checkOut.toISOString().slice(0, 10)
    }));

    res.json({ bookings: result });

  } catch (err) {
    console.error("Hotel bookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
