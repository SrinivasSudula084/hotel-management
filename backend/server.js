import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import bookingsRouter from "./routes/bookings.js";
import hotelsRouter from "./routes/hotels.js";
import ownerHotelsRouter from "./routes/ownerHotels.js";
import roomsRouter from "./routes/rooms.js";
import adminRoutes from "./routes/admin.js";

import uploadRoutes from "./routes/upload.js";




const PORT = process.env.PORT || 5000;


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.get("/", (req, res) => {
  res.send("Hotel Management Backend Running");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));
app.use("/uploads", express.static("uploads"));
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/hotels", hotelsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/rooms", roomsRouter);
// ✅ Correct – only one router for hotels+rooms
app.use("/api/owner/hotels", ownerHotelsRouter);
app.use("/api/admin", adminRoutes);
app.listen(PORT, () =>
  console.log(`Server running at port ${PORT}`)
);
