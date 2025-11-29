import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

// Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Upload Route
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // FINAL PUBLIC URL
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
;

  res.json({ url: imageUrl });
});

export default router;
