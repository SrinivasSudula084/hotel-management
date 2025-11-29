import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true, index: true },
  roomNumber: { type: String, required: true },
  category: { type: String, enum: ["Regular","Deluxe","Suite"], required: true, index: true },
  type: { type: String, enum: ["single","double","triple","quadruple"], required: true, index: true },
  maxGuests: { type: Number, required: true },
  pricePerNight: { type: Number, required: true },
  amenities: [String],
  createdAt: { type: Date, default: Date.now }
});

// optionally ensure unique room numbers per hotel
roomSchema.index({ hotel: 1, roomNumber: 1 }, { unique: true });

export default mongoose.model("Room", roomSchema);
