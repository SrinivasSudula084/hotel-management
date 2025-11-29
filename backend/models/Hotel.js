import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  name: { type: String, required: true, index: "text" },

  description: { type: String },

  location: {
    city: { type: String, index: true },
    state: String,
    address: String,
    coordinates: { lat: Number, lng: Number }
  },

  images: [String],

  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],

  avgRating: { type: Number, default: 0 },
  ratingsCount: { type: Number, default: 0 },

  // ⭐ ADD THIS FIELD
  approved: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

// text index
hotelSchema.index({ name: "text", description: "text" });

export default mongoose.model("Hotel", hotelSchema);
