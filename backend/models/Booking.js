import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true, index: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true, index: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true }, // exclusive
  nights: { type: Number, required: true },
  pricePerNight: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ["confirmed","cancelled","completed"], default: "confirmed" },
  createdAt: { type: Date, default: Date.now }
});

// Index to speed overlap queries
bookingSchema.index({ room: 1, checkIn: 1, checkOut: 1 });

export default mongoose.model("Booking", bookingSchema);
