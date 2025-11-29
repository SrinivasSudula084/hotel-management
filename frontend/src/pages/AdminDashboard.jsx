/* src/pages/user/AdminDashboard.jsx */
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const token = localStorage.getItem("adminToken");

  const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || "",
    headers: { Authorization: `Bearer ${token}` },
  });

  const [tab, setTab] = useState("stats");
  const [refreshKey, setRefreshKey] = useState(0);

  const [stats, setStats] = useState({
    totalOwners: 0,
    totalHotels: 0,
    totalBookings: 0,
  });

  const [owners, setOwners] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);

  const bookingsChart = useRef(null);
  const usersChart = useRef(null);
  const bookingsInstance = useRef(null);
  const usersInstance = useRef(null);

  useEffect(() => {
    loadStats();
    loadOwners();
    loadHotels();
    loadBookings();
    loadCharts();
  }, [refreshKey]);

  const loadStats = async () => {
    const res = await api.get("/api/admin/stats");
    setStats(res.data);
  };

  const loadOwners = async () => {
    const res = await api.get("/api/admin/owners");
    setOwners(res.data);
  };

  const loadHotels = async () => {
    const res = await api.get("/api/admin/hotels");
    setHotels(res.data);
  };

  const loadBookings = async () => {
    const res = await api.get("/api/admin/bookings");
    setBookings(res.data);
  };

  const loadCharts = async () => {};

  const refresh = () => setRefreshKey((p) => p + 1);

  const toggleVerifyOwner = async (id) => {
    await api.put(`/api/admin/owners/verify/${id}`);
    refresh();
  };

  const toggleApproveHotel = async (id) => {
    await api.put(`/api/admin/hotels/approve/${id}`);
    refresh();
  };

  const cancelBooking = async (id) => {
    await api.put(`/api/admin/bookings/cancel/${id}`);
    refresh();
  };

  return (
    <div className="admin-dashboard-wrapper">
      <h1 className="admin-title">Admin Dashboard</h1>

      <div className="top-cards">
        <div className="card">Owners: {stats.totalOwners}</div>
        <div className="card">Hotels: {stats.totalHotels}</div>
        <div className="card">Bookings: {stats.totalBookings}</div>
      </div>

      <nav className="admin-tabs">
       
        <button onClick={() => setTab("owners")} className={tab === "owners" ? "active" : ""}>
          Owners
        </button>
        <button onClick={() => setTab("hotels")} className={tab === "hotels" ? "active" : ""}>
          Hotels
        </button>
        <button onClick={() => setTab("bookings")} className={tab === "bookings" ? "active" : ""}>
          Bookings
        </button>
      </nav>

      {/* OWNERS */}
      {tab === "owners" && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Verified</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {owners.map((o) => (
              <tr key={o._id}>
                <td>{o.name}</td>
                <td>{o.email}</td>
                <td>
  {o.verified ? (
    <span className="badge badge-approved">Approved</span>
  ) : (
    <span className="badge badge-pending">Pending</span>
  )}
</td>

                <td>
                  <button onClick={() => toggleVerifyOwner(o._id)}>
                    {o.verified ? "Unverify" : "Verify"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* HOTELS */}
      {tab === "hotels" && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Owner</th>
              <th>Approved</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((h) => (
              <tr key={h._id}>
                <td>{h.name}</td>
                <td>{h.owner?.name || h.owner?.email}</td>
                <td>
  {h.approved ? (
    <span className="badge badge-approved">Approved</span>
  ) : (
    <span className="badge badge-pending">Pending</span>
  )}
</td>

                <td>
                  <button onClick={() => toggleApproveHotel(h._id)}>
                    {h.approved ? "Reject" : "Approve"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* BOOKINGS */}
      {tab === "bookings" && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Hotel</th>
              <th>Room</th>
              <th>Status</th>
              <th>Cancel</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{b.user?.name}</td>
                <td>{b.hotel?.name}</td>
                <td>{b.roomType}</td>
                <td>{b.status}</td>
                <td>
                  <button disabled={b.status === "cancelled"} onClick={() => cancelBooking(b._id)}>
                    {b.status === "cancelled" ? "Cancelled" : "Cancel"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
