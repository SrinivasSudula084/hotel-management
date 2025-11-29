import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + "/api",
});
// Auto-attach token for every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // Only attach if token looks valid
  if (token && token !== "undefined" && token !== "null" && token.trim() !== "") {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


export default api;
