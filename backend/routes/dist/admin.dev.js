"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _User = _interopRequireDefault(require("../models/User.js"));

var _Hotel = _interopRequireDefault(require("../models/Hotel.js"));

var _Booking = _interopRequireDefault(require("../models/Booking.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = _express["default"].Router();
/* ======================
      STATS
====================== */


router.get("/stats", function _callee(req, res) {
  var totalOwners, totalHotels, totalBookings;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(_User["default"].countDocuments({
            role: "owner"
          }));

        case 3:
          totalOwners = _context.sent;
          _context.next = 6;
          return regeneratorRuntime.awrap(_Hotel["default"].countDocuments());

        case 6:
          totalHotels = _context.sent;
          _context.next = 9;
          return regeneratorRuntime.awrap(_Booking["default"].countDocuments());

        case 9:
          totalBookings = _context.sent;
          res.json({
            totalUsers: 0,
            totalOwners: totalOwners,
            totalHotels: totalHotels,
            totalBookings: totalBookings
          });
          _context.next = 16;
          break;

        case 13:
          _context.prev = 13;
          _context.t0 = _context["catch"](0);
          res.status(500).json({
            error: "Stats error"
          });

        case 16:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 13]]);
});
/* ======================
      OWNERS LIST
====================== */

router.get("/owners", function _callee2(req, res) {
  var owners;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(_User["default"].find({
            role: "owner"
          }).sort({
            createdAt: -1
          }));

        case 3:
          owners = _context2.sent;
          res.json(owners);
          _context2.next = 10;
          break;

        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](0);
          res.status(500).json({
            error: "Owners error"
          });

        case 10:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 7]]);
});
/* ======================
      VERIFY OWNER
====================== */

router.put("/owners/verify/:id", function _callee3(req, res) {
  var owner;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          console.log("VERIFY OWNER HIT", req.params.id);
          _context3.next = 4;
          return regeneratorRuntime.awrap(_User["default"].findById(req.params.id));

        case 4:
          owner = _context3.sent;

          if (owner) {
            _context3.next = 7;
            break;
          }

          return _context3.abrupt("return", res.status(404).json({
            error: "Owner not found"
          }));

        case 7:
          owner.verified = !owner.verified;
          _context3.next = 10;
          return regeneratorRuntime.awrap(owner.save());

        case 10:
          res.json({
            message: "Owner updated",
            owner: owner
          });
          _context3.next = 17;
          break;

        case 13:
          _context3.prev = 13;
          _context3.t0 = _context3["catch"](0);
          console.log(_context3.t0);
          res.status(500).json({
            error: "Owner verify error"
          });

        case 17:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 13]]);
});
/* ======================
      HOTELS LIST
====================== */

router.get("/hotels", function _callee4(req, res) {
  var hotels;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return regeneratorRuntime.awrap(_Hotel["default"].find({}).populate("owner", "name email").sort({
            createdAt: -1
          }));

        case 3:
          hotels = _context4.sent;
          res.json(hotels);
          _context4.next = 10;
          break;

        case 7:
          _context4.prev = 7;
          _context4.t0 = _context4["catch"](0);
          res.status(500).json({
            error: "Hotels error"
          });

        case 10:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 7]]);
});
/* ======================
      APPROVE HOTEL
====================== */

router.put("/hotels/approve/:id", function _callee5(req, res) {
  var hotel;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          console.log("APPROVE HOTEL HIT", req.params.id);
          _context5.next = 4;
          return regeneratorRuntime.awrap(_Hotel["default"].findById(req.params.id));

        case 4:
          hotel = _context5.sent;

          if (hotel) {
            _context5.next = 7;
            break;
          }

          return _context5.abrupt("return", res.status(404).json({
            error: "Hotel not found"
          }));

        case 7:
          hotel.approved = !hotel.approved;
          _context5.next = 10;
          return regeneratorRuntime.awrap(hotel.save());

        case 10:
          res.json({
            message: "Hotel updated",
            hotel: hotel
          });
          _context5.next = 16;
          break;

        case 13:
          _context5.prev = 13;
          _context5.t0 = _context5["catch"](0);
          res.status(500).json({
            error: "Hotel approve error"
          });

        case 16:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 13]]);
});
/* ======================
      BOOKINGS LIST
====================== */

router.get("/bookings", function _callee6(req, res) {
  var bookings;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return regeneratorRuntime.awrap(_Booking["default"].find({}).populate("user", "name email").populate("hotel", "name").sort({
            createdAt: -1
          }));

        case 3:
          bookings = _context6.sent;
          res.json(bookings);
          _context6.next = 10;
          break;

        case 7:
          _context6.prev = 7;
          _context6.t0 = _context6["catch"](0);
          res.status(500).json({
            error: "Bookings error"
          });

        case 10:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 7]]);
});
/* ======================
      CANCEL BOOKING
====================== */

router.put("/bookings/cancel/:id", function _callee7(req, res) {
  var booking;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return regeneratorRuntime.awrap(_Booking["default"].findById(req.params.id));

        case 3:
          booking = _context7.sent;

          if (booking) {
            _context7.next = 6;
            break;
          }

          return _context7.abrupt("return", res.status(404).json({
            error: "Booking not found"
          }));

        case 6:
          booking.status = "cancelled";
          _context7.next = 9;
          return regeneratorRuntime.awrap(booking.save());

        case 9:
          res.json({
            message: "Booking cancelled",
            booking: booking
          });
          _context7.next = 15;
          break;

        case 12:
          _context7.prev = 12;
          _context7.t0 = _context7["catch"](0);
          res.status(500).json({
            error: "Cancel booking error"
          });

        case 15:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[0, 12]]);
});
var _default = router;
exports["default"] = _default;