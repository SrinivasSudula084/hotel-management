import { Routes, Route, Navigate } from "react-router-dom";

import UserLogin from "./pages/auth/UserLogin";
import OwnerLogin from "./pages/auth/OwnerLogin";
import AdminLogin from "./pages/auth/AdminLogin";
import UserRegister from "./pages/auth/UserRegister";
import OwnerRegister from "./pages/auth/OwnerRegister";
import Home from "./pages/Home";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerAddHotel from "./pages/owner/OwnerAddHotel";
import OwnerAddRooms from "./pages/owner/OwnerAddRooms";
import OwnerHotelsList from "./pages/owner/OwnerHotelsList";
import OwnerHotelPage from "./pages/owner/OwnerHotelPage";
import OwnerBookingsPage from "./pages/owner/OwnerBookingsPage";import HotelsList from "./pages/user/HotelsList.jsx";
import UserDashboard from "./pages/user/UserDashboard.jsx";
import UserHotelPage from "./pages/user/UserHotelPage";
import BookRoom from "./pages/user/BookRoom";
import UserRoomPage from "./pages/user/UserRoomPage.jsx";
import MyBookingsPage from "./pages/user/MyBookingsPage";
import OwnerRoomCalendarPage from "./pages/owner/OwnerRoomCalendarPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

import EditHotelPage from "./pages/owner/EditHotelPage.jsx";







/* inside <Routes> */


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<UserLogin />} />
      <Route path="/owner/login" element={<OwnerLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/register" element={<UserRegister />} />
      <Route path="/owner/register" element={<OwnerRegister />} />
      <Route path="/my-bookings" element={<MyBookingsPage />} />
      {/* REAL OWNER DASHBOARD */}
      <Route path="/owner/dashboard" element={<OwnerDashboard />} />
      <Route path="/book/:roomId" element={<BookRoom />} />
      {/* Add Hotel */}
      <Route path="/owner/add-hotel" element={<OwnerAddHotel />} />
      <Route path="/owner/hotels" element={<OwnerHotelsList />} />
      <Route path="/owner/hotel/:hotelId" element={<OwnerHotelPage />} />
      <Route path="/owner/hotels/bookings/all" element={<OwnerBookingsPage />} />
      {/* Add Rooms */}
      <Route path="/owner/hotel/:hotelId/add-rooms" element={<OwnerAddRooms />} />
      <Route path="/hotels" element={<HotelsList />} />
      <Route path="/hotels/:hotelId" element={<UserHotelPage />} />
      <Route path="/room/:roomId" element={<UserRoomPage />} />
      {/* other dashboards */}
      <Route path="/owner/room/:roomId/calendar" element={<OwnerRoomCalendarPage />} />
      <Route path="/owner/hotel/:hotelId/edit" element={<EditHotelPage />} />

      <Route path="/user/dashboard" element={<UserDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
