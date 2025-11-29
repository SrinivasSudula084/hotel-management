"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _Room = _interopRequireDefault(require("../models/Room.js"));

var _Hotel = _interopRequireDefault(require("../models/Hotel.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = _express["default"].Router(); // Get a single room by ID


router.get("/:roomId", function _callee(req, res) {
  var roomId, room;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          roomId = req.params.roomId;
          _context.next = 4;
          return regeneratorRuntime.awrap(_Room["default"].findById(roomId).populate("hotel"));

        case 4:
          room = _context.sent;

          if (room) {
            _context.next = 7;
            break;
          }

          return _context.abrupt("return", res.status(404).json({
            message: "Room not found"
          }));

        case 7:
          res.json({
            room: room
          });
          _context.next = 14;
          break;

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](0);
          console.error("Room fetch error:", _context.t0);
          res.status(500).json({
            message: "Server error"
          });

        case 14:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 10]]);
});
var _default = router;
exports["default"] = _default;