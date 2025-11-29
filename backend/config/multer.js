// backend/config/multer.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "hotel-management",           // change if you want subfolders like "hotel-management/hotels"
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    // you can also add transformation options here if needed
  },
});

const upload = multer({ storage });

export default upload;
