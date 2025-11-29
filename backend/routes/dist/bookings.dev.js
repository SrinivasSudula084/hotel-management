"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _Room = _interopRequireDefault(require("../models/Room.js"));

var _Booking = _interopRequireDefault(require("../models/Booking.js"));

var _Hotel = _interopRequireDefault(require("../models/Hotel.js"));

var _auth = _interopRequireDefault(require("../middleware/auth.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var router = _express["default"].Router();
/* -----------------------------------------------------
   Helper: Overlap Query
----------------------------------------------------- */


function overlapQuery(checkIn, checkOut) {
  return {
    $and: [{
      checkIn: {
        $lt: checkOut
      }
    }, {
      checkOut: {
        $gt: checkIn
      }
    }]
  };
}
/* -----------------------------------------------------
   AVAILABILITY CHECK
----------------------------------------------------- */


router.post("/availability", function _callee(req, res) {
  var _req$body, hotelId, category, type, checkIn, checkOut, checkInDate, checkOutDate, rooms, roomIds, overlapping, bookedRoomIds, freeRooms;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$body = req.body, hotelId = _req$body.hotelId, category = _req$body.category, type = _req$body.type, checkIn = _req$body.checkIn, checkOut = _req$body.checkOut;

          if (!(!hotelId || !checkIn || !checkOut)) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: "Missing fields"
          }));

        case 4:
          checkInDate = new Date(checkIn);
          checkOutDate = new Date(checkOut);
          _context.next = 8;
          return regeneratorRuntime.awrap(_Room["default"].find({
            hotel: hotelId,
            category: category,
            type: type
          }).lean());

        case 8:
          rooms = _context.sent;

          if (rooms.length) {
            _context.next = 11;
            break;
          }

          return _context.abrupt("return", res.json({
            availableCount: 0
          }));

        case 11:
          roomIds = rooms.map(function (r) {
            return r._id;
          });
          _context.next = 14;
          return regeneratorRuntime.awrap(_Booking["default"].find(_objectSpread({
            room: {
              $in: roomIds
            }
          }, overlapQuery(checkInDate, checkOutDate))).select("room"));

        case 14:
          overlapping = _context.sent;
          bookedRoomIds = new Set(overlapping.map(function (b) {
            return String(b.room);
          }));
          freeRooms = rooms.filter(function (r) {
            return !bookedRoomIds.has(String(r._id));
          });
          return _context.abrupt("return", res.json({
            availableCount: freeRooms.length,
            samplePrice: freeRooms.length ? freeRooms[0].pricePerNight : null
          }));

        case 20:
          _context.prev = 20;
          _context.t0 = _context["catch"](0);
          console.error("Availability error:", _context.t0);
          res.status(500).json({
            message: "Server error"
          });

        case 24:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 20]]);
});
/* -----------------------------------------------------
   CREATE BOOKING (Half-Day Supported)
----------------------------------------------------- */

router.post("/", _auth["default"], function _callee2(req, res) {
  var _req$body2, hotelId, category, type, checkIn, checkOut, userId, checkInDate, checkOutDate, nights, sameDay, diffDays, rooms, roomIds, overlapping, bookedRoomIds, freeRoom, hotel, pricePerNight, totalPrice, booking;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _req$body2 = req.body, hotelId = _req$body2.hotelId, category = _req$body2.category, type = _req$body2.type, checkIn = _req$body2.checkIn, checkOut = _req$body2.checkOut;
          userId = req.user.id;

          if (!(!hotelId || !checkIn || !checkOut)) {
            _context2.next = 5;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: "Missing fields"
          }));

        case 5:
          checkInDate = new Date(checkIn);
          checkOutDate = new Date(checkOut);

          if (!(isNaN(checkInDate) || isNaN(checkOutDate))) {
            _context2.next = 9;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: "Invalid date format"
          }));

        case 9:
          if (!(checkOutDate < checkInDate)) {
            _context2.next = 11;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: "Invalid date range"
          }));

        case 11:
          /* ⭐ NIGHT CALCULATION (Half-day) */
          nights = 0;
          sameDay = checkInDate.getFullYear() === checkOutDate.getFullYear() && checkInDate.getMonth() === checkOutDate.getMonth() && checkInDate.getDate() === checkOutDate.getDate();

          if (sameDay) {
            nights = 0.5; // Half-day booking
          } else {
            diffDays = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24);
            nights = Math.ceil(diffDays);
          }
          /* 1. Get Rooms */


          _context2.next = 16;
          return regeneratorRuntime.awrap(_Room["default"].find({
            hotel: hotelId,
            category: category,
            type: type
          }));

        case 16:
          rooms = _context2.sent;

          if (rooms.length) {
            _context2.next = 19;
            break;
          }

          return _context2.abrupt("return", res.status(404).json({
            message: "No rooms found"
          }));

        case 19:
          roomIds = rooms.map(function (r) {
            return r._id;
          });
          /* 2. Check Overlapping Bookings */

          _context2.next = 22;
          return regeneratorRuntime.awrap(_Booking["default"].find(_objectSpread({
            room: {
              $in: roomIds
            }
          }, overlapQuery(checkInDate, checkOutDate))));

        case 22:
          overlapping = _context2.sent;
          bookedRoomIds = new Set(overlapping.map(function (r) {
            return String(r.room);
          }));
          freeRoom = rooms.find(function (r) {
            return !bookedRoomIds.has(String(r._id));
          });

          if (freeRoom) {
            _context2.next = 27;
            break;
          }

          return _context2.abrupt("return", res.status(409).json({
            message: "No rooms free for selected dates"
          }));

        case 27:
          _context2.next = 29;
          return regeneratorRuntime.awrap(_Hotel["default"].findById(hotelId));

        case 29:
          hotel = _context2.sent;

          if (hotel) {
            _context2.next = 32;
            break;
          }

          return _context2.abrupt("return", res.status(404).json({
            message: "Hotel not found"
          }));

        case 32:
          /* ⭐ PRICE CALCULATION (Clean & Safe) */
          pricePerNight = freeRoom.pricePerNight;
          totalPrice = Math.round(pricePerNight * nights);
          /* 4. Create Booking */

          _context2.next = 36;
          return regeneratorRuntime.awrap(_Booking["default"].create({
            user: userId,
            owner: hotel.owner,
            hotel: hotelId,
            room: freeRoom._id,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            nights: nights,
            pricePerNight: pricePerNight,
            totalPrice: totalPrice,
            status: "confirmed"
          }));

        case 36:
          booking = _context2.sent;
          return _context2.abrupt("return", res.status(201).json({
            message: "Booking successful!",
            booking: booking
          }));

        case 40:
          _context2.prev = 40;
          _context2.t0 = _context2["catch"](0);
          console.error("Booking error:", _context2.t0);
          res.status(500).json({
            message: "Server error"
          });

        case 44:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 40]]);
});
/* -----------------------------------------------------
   GET USER BOOKINGS
----------------------------------------------------- */

router.get("/my", _auth["default"], function _callee3(req, res) {
  var bookings;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap(_Booking["default"].find({
            user: req.user.id
          }).populate("hotel", "name location images").populate("room", "roomNumber category type pricePerNight").sort({
            createdAt: -1
          }));

        case 3:
          bookings = _context3.sent;
          res.json({
            bookings: bookings
          });
          _context3.next = 11;
          break;

        case 7:
          _context3.prev = 7;
          _context3.t0 = _context3["catch"](0);
          console.error("Fetch my bookings error:", _context3.t0);
          res.status(500).json({
            message: "Server error"
          });

        case 11:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 7]]);
});
/* -----------------------------------------------------
   CANCEL BOOKING
----------------------------------------------------- */

router.put("/:id/cancel", _auth["default"], function _callee4(req, res) {
  var booking;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return regeneratorRuntime.awrap(_Booking["default"].findById(req.params.id));

        case 3:
          booking = _context4.sent;

          if (booking) {
            _context4.next = 6;
            break;
          }

          return _context4.abrupt("return", res.status(404).json({
            message: "Booking not found"
          }));

        case 6:
          if (!(String(booking.user) !== String(req.user.id))) {
            _context4.next = 8;
            break;
          }

          return _context4.abrupt("return", res.status(403).json({
            message: "Unauthorized"
          }));

        case 8:
          if (!(booking.status === "cancelled")) {
            _context4.next = 10;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            message: "Already cancelled"
          }));

        case 10:
          booking.status = "cancelled";
          _context4.next = 13;
          return regeneratorRuntime.awrap(booking.save());

        case 13:
          res.json({
            message: "Booking cancelled successfully",
            booking: booking
          });
          _context4.next = 20;
          break;

        case 16:
          _context4.prev = 16;
          _context4.t0 = _context4["catch"](0);
          console.error("Cancel error:", _context4.t0);
          res.status(500).json({
            message: "Server error"
          });

        case 20:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 16]]);
});
var _default = router;
exports["default"] = _default;