import express from "express";
import Hotel from "../models/Hotel.js";
import auth, { requireRole } from "../middleware/auth.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";  

const router = express.Router();

// GET all hotels for current owner
router.get("/my-hotels", auth, requireRole("owner"), async (req, res) => {
  try {
    const hotels = await Hotel.find({ owner: req.user.id });
    res.json({ hotels });
  } catch (err) {
    console.error("my-hotels ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});
router.post("/", auth, requireRole("owner"), async (req, res) => {
  try {
    const { name, location, images, description } = req.body;

    // Load owner from DB
    const owner = await User.findById(req.user.id);

    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    // Use correct field → verified
    if (!owner.verified) {
      return res.status(403).json({
        success: false,
        message: "Your account is not verified. You cannot add hotels.",
      });
    }

    const normalizedLocation =
      typeof location === "string"
        ? { city: location, state: "", address: "" }
        : location || {};

    const hotel = await Hotel.create({
      owner: req.user.id,
      name,
      location: normalizedLocation,
      images,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Hotel created successfully",
      hotelId: hotel._id,
    });
  } catch (err) {
    console.error("Create hotel error:", err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE HOTEL (Owner Only)
router.delete("/:hotelId", auth, requireRole("owner"), async (req, res) => {
  try {
    const { hotelId } = req.params;

    const hotel = await Hotel.findOne({ _id: hotelId, owner: req.user.id });
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found or unauthorized" });
    }

    // Delete associated rooms
    await Room.deleteMany({ hotel: hotelId });

    // Delete associated bookings
    await Booking.deleteMany({ hotel: hotelId });

    // Delete the hotel
    await hotel.deleteOne();

    res.json({ message: "Hotel deleted successfully" });
  } catch (err) {
    console.error("Delete hotel error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
/* ============================================
   🔥 EDIT HOTEL (Owner Only)
============================================ */
/* ============================================
   OWNER — EDIT HOTEL
============================================ */
router.put("/:hotelId", auth, requireRole("owner"), async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { name, description, location, images } = req.body;

    const hotel = await Hotel.findOne({ _id: hotelId, owner: req.user.id });
    if (!hotel)
      return res.status(404).json({ message: "Hotel not found or unauthorized" });

    hotel.name = name || hotel.name;
    hotel.description = description || hotel.description;
    hotel.location = location || hotel.location;
    hotel.images = images || hotel.images;

    await hotel.save();

    res.json({ message: "Hotel updated successfully", hotel });
  } catch (err) {
    console.error("Update hotel error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// GET SPECIFIC HOTEL + ROOMS
router.get("/:hotelId", auth, requireRole("owner"), async (req, res) => {
  try {
    const { hotelId } = req.params;

    const hotel = await Hotel.findOne({
      _id: hotelId,
      owner: req.user.id,
    }).populate("rooms");

    if (!hotel)
      return res.status(404).json({ message: "Hotel not found or unauthorized" });

    res.json({ hotel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD ROOMS TO HOTEL
router.post("/:hotelId/rooms", auth, requireRole("owner"), async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { rooms } = req.body;

    if (!rooms || rooms.length === 0)
      return res.status(400).json({ message: "No rooms provided" });

    const hotel = await Hotel.findOne({ _id: hotelId, owner: req.user.id });
    if (!hotel)
      return res.status(404).json({ message: "Hotel not found or unauthorized" });

    const createdRooms = [];

    for (const r of rooms) {
      const newRoom = await Room.create({
        hotel: hotelId,
        roomNumber: r.roomNumber,
        category: r.category,
        type: r.type,
        maxGuests: r.maxGuests,
        pricePerNight: r.pricePerNight,
      });

      hotel.rooms.push(newRoom._id);
      createdRooms.push(newRoom);
    }

    await hotel.save();

    res.status(201).json({
      message: "Rooms added successfully",
      rooms: createdRooms,
    });
  } catch (err) {
    console.error("Room creation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
/* ============================================
   🔥 DELETE ROOM (Owner Only)
============================================ */
router.delete("/rooms/:roomId", auth, requireRole("owner"), async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Verify owner actually owns the room's hotel
    const hotel = await Hotel.findOne({ _id: room.hotel, owner: req.user.id });
    if (!hotel)
      return res.status(403).json({ message: "Unauthorized room delete" });

    // Delete all bookings tied to this room
    await Booking.deleteMany({ room: roomId });

    // Remove room from hotel's rooms array
    await Hotel.updateOne(
      { _id: room.hotel },
      { $pull: { rooms: roomId } }
    );

    // Delete room
    await Room.findByIdAndDelete(roomId);

    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    console.error("Delete room error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ============================================
   🔥 NEW ROUTE: GET BOOKED ROOM IDs FOR HOTEL
   Used to show ✔ BOOKED badge in hotel page
   ============================================ */
router.get("/:hotelId/booked-rooms", auth, requireRole("owner"), async (req, res) => {
  try {
    const { hotelId } = req.params;

    // Only confirmed bookings count as booked
    const activeBookings = await Booking.find({
      hotel: hotelId,
      status: "confirmed",
    }).select("room");

    const bookedRoomIds = activeBookings.map((b) => b.room.toString());

    res.json({ bookedRoomIds });
  } catch (err) {
    console.error("Booked rooms error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================================
   🔥 NEW ROUTE: GET ALL BOOKINGS FOR OWNER
   For separate bookings page
 /* ============================================
   🔥 OWNER — GET ALL BOOKINGS (with bookingId)
============================================ */
router.get("/bookings/all", auth, requireRole("owner"), async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user.id })
      .populate("hotel", "name images location")
      .populate("room", "roomNumber type")
      .populate("user", "name email")
      .lean();

    const result = bookings.map((b) => ({
      bookingId: b._id,            // ✅ REQUIRED
      userName: b.user?.name,
      userEmail: b.user?.email,
      hotel: b.hotel,
      room: b.room,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      status: b.status,
      pricePerNight: b.pricePerNight,
      totalPrice: b.totalPrice,
      cancelReason: b.cancelReason || null
    }));

    res.json({ bookings: result });
  } catch (err) {
    console.error("Owner bookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ============================================
   🔥 OWNER — GET BOOKINGS FOR SPECIFIC ROOM
============================================ */
router.get("/bookings/room/:roomId", auth, requireRole("owner"), async (req, res) => {
  try {
    const bookings = await Booking.find({ room: req.params.roomId })
      .populate("user", "name email")
      .lean();

    const result = bookings.map(b => ({
      bookingId: b._id,             // ✅ REQUIRED
      userName: b.user?.name,
      userEmail: b.user?.email,
      checkIn: b.checkIn.toISOString(),
      checkOut: b.checkOut.toISOString(),
      pricePerNight: b.pricePerNight,
      totalPrice: b.totalPrice,
      status: b.status,
      cancelReason: b.cancelReason || null,
    }));

    res.json({ bookings: result });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


/* ============================================
   🔥 OWNER — ROOM CALENDAR
============================================ */
router.get("/room/:roomId/calendar", auth, requireRole("owner"), async (req, res) => {
  try {
    const roomId = req.params.roomId;

    const bookings = await Booking.find({ room: roomId })
      .populate("user", "name email")
      .lean();

    const result = bookings.map(b => ({
      bookingId: b._id,              // ✅ REQUIRED
      checkIn: b.checkIn.toISOString(),
      checkOut: b.checkOut.toISOString(),
      userName: b.user?.name || "Unknown User",
      userEmail: b.user?.email || "",
      pricePerNight: b.pricePerNight,
      totalPrice: b.totalPrice,
      status: b.status,
      cancelReason: b.cancelReason || null
    }));

    res.json({ bookings: result });

  } catch (err) {
    console.error("Calendar API error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ============================================
   🔥 OWNER — CANCEL BOOKING (PUT)
============================================ */
// ================================
//   OWNER CANCEL BOOKING (WORKS)
// ================================
router.put("/bookings/:bookingId/cancel", auth, requireRole("owner"), async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if this booking belongs to this owner
    const hotel = await Hotel.findOne({
      _id: booking.hotel,
      owner: req.user.id
    });

    if (!hotel) {
      return res.status(403).json({ message: "Unauthorized to cancel this booking" });
    }

    // Mark booking as cancelled
    booking.status = "cancelled";
    booking.cancelReason = req.body.reasonKey === "other" ? req.body.reasonOther : req.body.reasonKey;
    booking.cancelledAt = new Date();

    await booking.save();

    res.json({ message: "Booking cancelled successfully" });

  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
