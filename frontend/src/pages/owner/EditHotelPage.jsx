// src/pages/owner/EditHotelPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/Navbar1";
import "./EditHotelPage.css";

export default function EditHotelPage() {
  const { hotelId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    city: "",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHotel();
  }, []);

  async function loadHotel() {
    try {
      const res = await api.get(`/owner/hotels/${hotelId}`);
      const h = res.data.hotel;

      setForm({
        name: h.name,
        description: h.description,
        city: h.location?.city || "",
      });

      setExistingImages(h.images || []);
    } catch (err) {
      alert("Failed to load hotel");
    } finally {
      setLoading(false);
    }
  }

  async function uploadImages(files) {
    const uploaded = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      uploaded.push(res.data.url);
    }

    return uploaded;
  }

  const updateHotel = async (e) => {
    e.preventDefault();

    try {
      let finalImages = [];

      if (newImages.length > 0) {
        const uploadedUrls = await uploadImages(newImages);
        finalImages = uploadedUrls;
      } else {
        finalImages = existingImages;
      }

      await api.put(`/owner/hotels/${hotelId}`, {
        name: form.name,
        description: form.description,
        location: { city: form.city },
        images: finalImages,
      });

      alert("Hotel updated!");
      navigate(`/owner/hotel/${hotelId}`);
    } catch (err) {
      console.log(err);
      alert("Failed to update hotel");
    }
  };

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  const handleNewImages = (e) => {
    setNewImages([...e.target.files]);
  };

  if (loading)
    return (
      <p className="loading-text">Loading...</p>
    );

  return (
    <div className="edit-hotel-container">
      <Navbar />

      <div className="edit-hotel-wrapper">
        <h2 className="page-title">Edit Hotel</h2>

        <form onSubmit={updateHotel} className="edit-hotel-form">
          <label>Hotel Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <label>City</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />

          <label>Existing Images</label>
          <div className="images-grid">
            {existingImages.map((img) => (
              <div key={img} className="img-box">
                <img src={img} className="preview-img" />
                <button
                  type="button"
                  className="remove-img-btn"
                  onClick={() => removeExistingImage(img)}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>

          <label>Upload New Images</label>
          <input type="file" multiple accept="image/*" onChange={handleNewImages} />

          {newImages.length > 0 && (
            <div className="images-grid">
              {newImages.map((file, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(file)}
                  className="preview-img"
                />
              ))}
            </div>
          )}

          <button type="submit" className="gold-btn save-btn">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
