import express from "express";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";

const router = express.Router();

// Get a single room by ID
router.get("/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId).populate("hotel");

    if (!room) return res.status(404).json({ message: "Room not found" });

    res.json({ room });
  } catch (err) {
    console.error("Room fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
