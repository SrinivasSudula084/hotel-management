// src/pages/owner/OwnerAddHotel.jsx
import React, { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./OwnerAddHotel.css"; // ⭐ new CSS file
import Navbar from "../../components/Navbar1";
export default function OwnerAddHotel() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const CLOUD_NAME = "dxt8zhhnq";
  const UPLOAD_PRESET = "unsigned_preset";

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    city: "",
    state: "",
    address: "",
    images: [],
  });

  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );
      const result = await res.json();

      if (result.secure_url) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, result.secure_url],
        }));
      }
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.city ||
      !formData.address ||
      formData.images.length === 0
    ) {
      return alert("Please fill name, city, address and upload at least one image.");
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      location: {
        city: formData.city,
        state: formData.state,
        address: formData.address,
      },
      images: formData.images,
    };

    try {
      await api.post("/owner/hotels", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Hotel added successfully!");
      navigate("/owner/hotels");
    } catch (err) {
      console.error("Hotel create error:", err);
      alert(err.response?.data?.message || "Failed to add hotel");
    }
  };

  return (
    <>
    <Navbar />
    <div className="add-hotel-container">
      
      <div className="add-hotel-card">
        <h2 className="add-hotel-title">Add New Hotel</h2>

        <form onSubmit={handleSubmit} className="add-hotel-form">
          <input
            className="input"
            type="text"
            placeholder="Hotel Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="form-row">
            <input
              className="input"
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              required
            />

            <input
              className="input"
              type="text"
              placeholder="State"
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
            />
          </div>

          <input
            className="input"
            type="text"
            placeholder="Address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            required
          />

          <textarea
            className="textarea"
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <div className="upload-section">
            <label className="upload-label">Upload Hotel Images</label>
            <label className="upload-btn">
  📁 Upload Image
  <input type="file" onChange={handleImageUpload} hidden />
</label>
            {uploading && <p className="uploading-text">Uploading image...</p>}

            <div className="image-preview-container">
              {formData.images.map((url, i) => (
                <img key={i} src={url} className="preview-img" alt="hotel" />
              ))}
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Add Hotel
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
