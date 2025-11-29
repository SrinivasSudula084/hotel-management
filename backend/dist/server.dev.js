"use strict";

var _dotenv = _interopRequireDefault(require("dotenv"));

var _express = _interopRequireDefault(require("express"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _cors = _interopRequireDefault(require("cors"));

var _auth = _interopRequireDefault(require("./routes/auth.js"));

var _bookings = _interopRequireDefault(require("./routes/bookings.js"));

var _hotels = _interopRequireDefault(require("./routes/hotels.js"));

var _ownerHotels = _interopRequireDefault(require("./routes/ownerHotels.js"));

var _rooms = _interopRequireDefault(require("./routes/rooms.js"));

var _admin = _interopRequireDefault(require("./routes/admin.js"));

var _upload = _interopRequireDefault(require("./routes/upload.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_dotenv["default"].config();

var app = (0, _express["default"])();
app.use((0, _cors["default"])());
app.use(_express["default"].json());
app.get("/", function (req, res) {
  res.send("Hotel Management Backend Running");
});

_mongoose["default"].connect(process.env.MONGO_URI).then(function () {
  return console.log("MongoDB Connected");
})["catch"](function (err) {
  return console.log(err);
});

app.use("/uploads", _express["default"]["static"]("uploads"));
app.use("/api/upload", _upload["default"]);
app.use("/api/auth", _auth["default"]);
app.use("/api/hotels", _hotels["default"]);
app.use("/api/bookings", _bookings["default"]);
app.use("/api/rooms", _rooms["default"]); // ✅ Correct – only one router for hotels+rooms

app.use("/api/owner/hotels", _ownerHotels["default"]);
app.use("/api/admin", _admin["default"]);
app.listen(process.env.PORT, function () {
  return console.log("Server running at port ".concat(process.env.PORT));
});