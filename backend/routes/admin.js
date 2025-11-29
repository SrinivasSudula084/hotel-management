import express from "express";
import User from "../models/User.js";
import Hotel from "../models/Hotel.js";
import Booking from "../models/Booking.js";

const router = express.Router();

/* ======================
      STATS
====================== */
router.get("/stats", async (req, res) => {
  try {
    const totalOwners = await User.countDocuments({ role: "owner" });
    const totalHotels = await Hotel.countDocuments();
    const totalBookings = await Booking.countDocuments();

    res.json({ totalUsers: 0, totalOwners, totalHotels, totalBookings });
  } catch (err) {
    res.status(500).json({ error: "Stats error" });
  }
});

/* ======================
      OWNERS LIST
====================== */
router.get("/owners", async (req, res) => {
  try {
    const owners = await User.find({ role: "owner" })
      .sort({ createdAt: -1 });
    res.json(owners);
  } catch (err) {
    res.status(500).json({ error: "Owners error" });
  }
});

/* ======================
      VERIFY OWNER
====================== */
router.put("/owners/verify/:id", async (req, res) => {
  try {
    console.log("VERIFY OWNER HIT", req.params.id);

    const owner = await User.findById(req.params.id);
    if (!owner) return res.status(404).json({ error: "Owner not found" });

    owner.verified = !owner.verified;
    await owner.save();

    res.json({ message: "Owner updated", owner });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Owner verify error" });
  }
});

/* ======================
      HOTELS LIST
====================== */
router.get("/hotels", async (req, res) => {
  try {
    const hotels = await Hotel.find({})
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: "Hotels error" });
  }
});

/* ======================
      APPROVE HOTEL
====================== */
router.put("/hotels/approve/:id", async (req, res) => {
  try {
    console.log("APPROVE HOTEL HIT", req.params.id);

    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ error: "Hotel not found" });

    hotel.approved = !hotel.approved;
    await hotel.save();

    res.json({ message: "Hotel updated", hotel });
  } catch (err) {
    res.status(500).json({ error: "Hotel approve error" });
  }
});

/* ======================
      BOOKINGS LIST
====================== */
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("user", "name email")
      .populate("hotel", "name")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Bookings error" });
  }
});

/* ======================
      CANCEL BOOKING
====================== */
router.put("/bookings/cancel/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled", booking });
  } catch (err) {
    res.status(500).json({ error: "Cancel booking error" });
  }
});

export default router;
