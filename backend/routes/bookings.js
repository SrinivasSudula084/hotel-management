import express from "express";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* -----------------------------------------------------
   Helper: Overlap Query
----------------------------------------------------- */
function overlapQuery(checkIn, checkOut) {
  return {
    $and: [
      { checkIn: { $lt: checkOut } },
      { checkOut: { $gt: checkIn } }
    ]
  };
}

/* -----------------------------------------------------
   AVAILABILITY CHECK
----------------------------------------------------- */
router.post("/availability", async (req, res) => {
  try {
    const { hotelId, category, type, checkIn, checkOut } = req.body;

    if (!hotelId || !checkIn || !checkOut)
      return res.status(400).json({ message: "Missing fields" });

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const rooms = await Room.find({ hotel: hotelId, category, type }).lean();
    if (!rooms.length)
      return res.json({ availableCount: 0 });

    const roomIds = rooms.map(r => r._id);

    const overlapping = await Booking.find({
      room: { $in: roomIds },
      ...overlapQuery(checkInDate, checkOutDate)
    }).select("room");

    const bookedRoomIds = new Set(overlapping.map(b => String(b.room)));
    const freeRooms = rooms.filter(r => !bookedRoomIds.has(String(r._id)));

    return res.json({
      availableCount: freeRooms.length,
      samplePrice: freeRooms.length ? freeRooms[0].pricePerNight : null
    });

  } catch (err) {
    console.error("Availability error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------------------------------------
   CREATE BOOKING (Half-Day Supported)
----------------------------------------------------- */
router.post("/", auth, async (req, res) => {
  try {
    const { hotelId, category, type, checkIn, checkOut } = req.body;
    const userId = req.user.id;

    if (!hotelId || !checkIn || !checkOut)
      return res.status(400).json({ message: "Missing fields" });

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate) || isNaN(checkOutDate))
      return res.status(400).json({ message: "Invalid date format" });

    /* ⭐ FIX: Only block reversed dates (not same-day) */
    if (checkOutDate < checkInDate)
      return res.status(400).json({ message: "Invalid date range" });

    /* ⭐ NIGHT CALCULATION (Half-day) */
    let nights = 0;

    const sameDay =
      checkInDate.getFullYear() === checkOutDate.getFullYear() &&
      checkInDate.getMonth() === checkOutDate.getMonth() &&
      checkInDate.getDate() === checkOutDate.getDate();

    if (sameDay) {
      nights = 0.5;  // Half-day booking
    } else {
      const diffDays = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24);
      nights = Math.ceil(diffDays);
    }

    /* 1. Get Rooms */
    const rooms = await Room.find({ hotel: hotelId, category, type });
    if (!rooms.length)
      return res.status(404).json({ message: "No rooms found" });

    const roomIds = rooms.map(r => r._id);

    /* 2. Check Overlapping Bookings */
    const overlapping = await Booking.find({
      room: { $in: roomIds },
      ...overlapQuery(checkInDate, checkOutDate)
    });

    const bookedRoomIds = new Set(overlapping.map(r => String(r.room)));

    const freeRoom = rooms.find(r => !bookedRoomIds.has(String(r._id)));

    if (!freeRoom)
      return res.status(409).json({ message: "No rooms free for selected dates" });

    /* 3. Get Hotel Owner */
    const hotel = await Hotel.findById(hotelId);
    if (!hotel)
      return res.status(404).json({ message: "Hotel not found" });

    /* ⭐ PRICE CALCULATION (Clean & Safe) */
    const pricePerNight = freeRoom.pricePerNight;
    const totalPrice = Math.round(pricePerNight * nights);

    /* 4. Create Booking */
    const booking = await Booking.create({
      user: userId,
      owner: hotel.owner,
      hotel: hotelId,
      room: freeRoom._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      pricePerNight,
      totalPrice,
      status: "confirmed",
    });

    return res.status(201).json({
      message: "Booking successful!",
      booking,
    });

  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------------------------------------
   GET USER BOOKINGS
----------------------------------------------------- */
router.get("/my", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("hotel", "name location images")
      .populate("room", "roomNumber category type pricePerNight")
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (err) {
    console.error("Fetch my bookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------------------------------------
   CANCEL BOOKING
----------------------------------------------------- */
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    if (String(booking.user) !== String(req.user.id))
      return res.status(403).json({ message: "Unauthorized" });

    if (booking.status === "cancelled")
      return res.status(400).json({ message: "Already cancelled" });

    booking.status = "cancelled";
    await booking.save();

    res.json({
      message: "Booking cancelled successfully",
      booking
    });

  } catch (err) {
    console.error("Cancel error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
