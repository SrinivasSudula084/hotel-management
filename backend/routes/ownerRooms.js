import express from "express";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import auth, { requireRole } from "../middleware/auth.js";

const router = express.Router();

// ADD ROOMS TO A HOTEL
// POST /api/owner/hotels/:hotelId/rooms
router.post(
  "/:hotelId/rooms",
  auth,
  requireRole("owner"),
  async (req, res) => {
    try {
      const { hotelId } = req.params;
      const { rooms } = req.body;

      // Verify hotel exists
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) return res.status(404).json({ message: "Hotel not found" });

      // Verify owner owns the hotel
      if (hotel.owner.toString() !== req.user.id) {
        return res.status(403).json({ message: "You don't own this hotel" });
      }

      // Prepare room docs
      const roomDocs = rooms.map((r) => ({
        ...r,
        hotel: hotelId,
        owner: req.user.id,
      }));

      await Room.insertMany(roomDocs);

      res.json({ message: "Rooms added successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
