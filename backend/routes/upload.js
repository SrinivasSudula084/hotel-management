// backend/routes/upload.js
import express from "express";
import upload from "../config/multer.js";

const router = express.Router();

router.post("/", upload.single("image"), (req, res) => {
  try {
    // multer-storage-cloudinary sets req.file.path to the Cloudinary URL
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    return res.json({ url: req.file.path });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Upload failed" });
  }
});

export default router;
