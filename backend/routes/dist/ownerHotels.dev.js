"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _Hotel = _interopRequireDefault(require("../models/Hotel.js"));

var _auth = _interopRequireWildcard(require("../middleware/auth.js"));

var _Room = _interopRequireDefault(require("../models/Room.js"));

var _Booking = _interopRequireDefault(require("../models/Booking.js"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = _express["default"].Router(); // GET all hotels for current owner


router.get("/my-hotels", _auth["default"], (0, _auth.requireRole)("owner"), function _callee(req, res) {
  var hotels;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(_Hotel["default"].find({
            owner: req.user.id
          }));

        case 3:
          hotels = _context.sent;
          res.json({
            hotels: hotels
          });
          _context.next = 11;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          console.error("my-hotels ERROR:", _context.t0);
          res.status(500).json({
            message: _context.t0.message
          });

        case 11:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // OWNER CREATES HOTEL

router.post("/", _auth["default"], (0, _auth.requireRole)("owner"), function _callee2(req, res) {
  var _req$body, name, location, images, description, normalizedLocation, hotel;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _req$body = req.body, name = _req$body.name, location = _req$body.location, images = _req$body.images, description = _req$body.description;
          normalizedLocation = typeof location === "string" ? {
            city: location,
            state: "",
            address: ""
          } : location || {};
          _context2.next = 5;
          return regeneratorRuntime.awrap(_Hotel["default"].create({
            owner: req.user.id,
            name: name,
            location: normalizedLocation,
            images: images,
            description: description
          }));

        case 5:
          hotel = _context2.sent;
          res.status(201).json({
            message: "Hotel created successfully",
            hotelId: hotel._id
          });
          _context2.next = 12;
          break;

        case 9:
          _context2.prev = 9;
          _context2.t0 = _context2["catch"](0);
          res.status(500).json({
            message: _context2.t0.message
          });

        case 12:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 9]]);
}); // DELETE HOTEL (Owner Only)

router["delete"]("/:hotelId", _auth["default"], (0, _auth.requireRole)("owner"), function _callee3(req, res) {
  var hotelId, hotel;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          hotelId = req.params.hotelId;
          _context3.next = 4;
          return regeneratorRuntime.awrap(_Hotel["default"].findOne({
            _id: hotelId,
            owner: req.user.id
          }));

        case 4:
          hotel = _context3.sent;

          if (hotel) {
            _context3.next = 7;
            break;
          }

          return _context3.abrupt("return", res.status(404).json({
            message: "Hotel not found or unauthorized"
          }));

        case 7:
          _context3.next = 9;
          return regeneratorRuntime.awrap(_Room["default"].deleteMany({
            hotel: hotelId
          }));

        case 9:
          _context3.next = 11;
          return regeneratorRuntime.awrap(_Booking["default"].deleteMany({
            hotel: hotelId
          }));

        case 11:
          _context3.next = 13;
          return regeneratorRuntime.awrap(hotel.deleteOne());

        case 13:
          res.json({
            message: "Hotel deleted successfully"
          });
          _context3.next = 20;
          break;

        case 16:
          _context3.prev = 16;
          _context3.t0 = _context3["catch"](0);
          console.error("Delete hotel error:", _context3.t0);
          res.status(500).json({
            message: "Server error"
          });

        case 20:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 16]]);
}); // GET SPECIFIC HOTEL + ROOMS

router.get("/:hotelId", _auth["default"], (0, _auth.requireRole)("owner"), function _callee4(req, res) {
  var hotelId, hotel;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          hotelId = req.params.hotelId;
          _context4.next = 4;
          return regeneratorRuntime.awrap(_Hotel["default"].findOne({
            _id: hotelId,
            owner: req.user.id
          }).populate("rooms"));

        case 4:
          hotel = _context4.sent;

          if (hotel) {
            _context4.next = 7;
            break;
          }

          return _context4.abrupt("return", res.status(404).json({
            message: "Hotel not found or unauthorized"
          }));

        case 7:
          res.json({
            hotel: hotel
          });
          _context4.next = 13;
          break;

        case 10:
          _context4.prev = 10;
          _context4.t0 = _context4["catch"](0);
          res.status(500).json({
            message: _context4.t0.message
          });

        case 13:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 10]]);
}); // ADD ROOMS TO HOTEL

router.post("/:hotelId/rooms", _auth["default"], (0, _auth.requireRole)("owner"), function _callee5(req, res) {
  var hotelId, rooms, hotel, createdRooms, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, r, newRoom;

  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          hotelId = req.params.hotelId;
          rooms = req.body.rooms;

          if (!(!rooms || rooms.length === 0)) {
            _context5.next = 5;
            break;
          }

          return _context5.abrupt("return", res.status(400).json({
            message: "No rooms provided"
          }));

        case 5:
          _context5.next = 7;
          return regeneratorRuntime.awrap(_Hotel["default"].findOne({
            _id: hotelId,
            owner: req.user.id
          }));

        case 7:
          hotel = _context5.sent;

          if (hotel) {
            _context5.next = 10;
            break;
          }

          return _context5.abrupt("return", res.status(404).json({
            message: "Hotel not found or unauthorized"
          }));

        case 10:
          createdRooms = [];
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context5.prev = 14;
          _iterator = rooms[Symbol.iterator]();

        case 16:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context5.next = 26;
            break;
          }

          r = _step.value;
          _context5.next = 20;
          return regeneratorRuntime.awrap(_Room["default"].create({
            hotel: hotelId,
            roomNumber: r.roomNumber,
            category: r.category,
            type: r.type,
            maxGuests: r.maxGuests,
            pricePerNight: r.pricePerNight
          }));

        case 20:
          newRoom = _context5.sent;
          hotel.rooms.push(newRoom._id);
          createdRooms.push(newRoom);

        case 23:
          _iteratorNormalCompletion = true;
          _context5.next = 16;
          break;

        case 26:
          _context5.next = 32;
          break;

        case 28:
          _context5.prev = 28;
          _context5.t0 = _context5["catch"](14);
          _didIteratorError = true;
          _iteratorError = _context5.t0;

        case 32:
          _context5.prev = 32;
          _context5.prev = 33;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 35:
          _context5.prev = 35;

          if (!_didIteratorError) {
            _context5.next = 38;
            break;
          }

          throw _iteratorError;

        case 38:
          return _context5.finish(35);

        case 39:
          return _context5.finish(32);

        case 40:
          _context5.next = 42;
          return regeneratorRuntime.awrap(hotel.save());

        case 42:
          res.status(201).json({
            message: "Rooms added successfully",
            rooms: createdRooms
          });
          _context5.next = 49;
          break;

        case 45:
          _context5.prev = 45;
          _context5.t1 = _context5["catch"](0);
          console.error("Room creation error:", _context5.t1);
          res.status(500).json({
            message: "Server error"
          });

        case 49:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 45], [14, 28, 32, 40], [33,, 35, 39]]);
});
/* ============================================
   🔥 NEW ROUTE: GET BOOKED ROOM IDs FOR HOTEL
   Used to show ✔ BOOKED badge in hotel page
   ============================================ */

router.get("/:hotelId/booked-rooms", _auth["default"], (0, _auth.requireRole)("owner"), function _callee6(req, res) {
  var hotelId, activeBookings, bookedRoomIds;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          hotelId = req.params.hotelId; // Only confirmed bookings count as booked

          _context6.next = 4;
          return regeneratorRuntime.awrap(_Booking["default"].find({
            hotel: hotelId,
            status: "confirmed"
          }).select("room"));

        case 4:
          activeBookings = _context6.sent;
          bookedRoomIds = activeBookings.map(function (b) {
            return b.room.toString();
          });
          res.json({
            bookedRoomIds: bookedRoomIds
          });
          _context6.next = 13;
          break;

        case 9:
          _context6.prev = 9;
          _context6.t0 = _context6["catch"](0);
          console.error("Booked rooms error:", _context6.t0);
          res.status(500).json({
            message: "Server error"
          });

        case 13:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 9]]);
});
/* ============================================
   🔥 NEW ROUTE: GET ALL BOOKINGS FOR OWNER
   For separate bookings page
   ============================================ */

router.get("/bookings/all", _auth["default"], (0, _auth.requireRole)("owner"), function _callee7(req, res) {
  var bookings;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return regeneratorRuntime.awrap(_Booking["default"].find({
            owner: req.user.id
          }).populate("hotel", "name").populate("room", "roomNumber").populate("user", "name email"));

        case 3:
          bookings = _context7.sent;
          res.json({
            bookings: bookings
          });
          _context7.next = 11;
          break;

        case 7:
          _context7.prev = 7;
          _context7.t0 = _context7["catch"](0);
          console.error("Owner bookings error:", _context7.t0);
          res.status(500).json({
            message: "Server error"
          });

        case 11:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // OWNER — GET bookings for a specific room

router.get("/bookings/room/:roomId", _auth["default"], (0, _auth.requireRole)("owner"), function _callee8(req, res) {
  var bookings, result;
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          _context8.next = 3;
          return regeneratorRuntime.awrap(_Booking["default"].find({
            room: req.params.roomId
          }).populate("user", "name email").lean());

        case 3:
          bookings = _context8.sent;
          result = bookings.map(function (b) {
            return {
              userName: b.user.name,
              userEmail: b.user.email,
              checkIn: b.checkIn.toISOString(),
              checkOut: b.checkOut.toISOString(),
              pricePerNight: b.pricePerNight,
              totalPrice: b.totalPrice
            };
          });
          res.json({
            bookings: result
          });
          _context8.next = 11;
          break;

        case 8:
          _context8.prev = 8;
          _context8.t0 = _context8["catch"](0);
          res.status(500).json({
            message: "Server error"
          });

        case 11:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[0, 8]]);
});
var _default = router;
exports["default"] = _default;