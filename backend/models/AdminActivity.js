// backend/models/AdminActivity.js
import mongoose from "mongoose";

const adminActivitySchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: false },
  adminEmail: { type: String }, // helpful if admin model not used
  action: { type: String, required: true }, // e.g., "block_user"
  resource: { type: String }, // e.g., "user"
  resourceId: { type: String },
}, { timestamps: true });

export default mongoose.model("AdminActivity", adminActivitySchema);
