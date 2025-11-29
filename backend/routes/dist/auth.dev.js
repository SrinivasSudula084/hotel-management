"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _User = _interopRequireDefault(require("../models/User.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = _express["default"].Router();

router.post("/register", function _callee(req, res) {
  var _req$body, name, email, password, role, exists, hashed;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$body = req.body, name = _req$body.name, email = _req$body.email, password = _req$body.password, role = _req$body.role;

          if (["user", "owner"].includes(role)) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: "Invalid role"
          }));

        case 4:
          _context.next = 6;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            email: email
          }));

        case 6:
          exists = _context.sent;

          if (!exists) {
            _context.next = 9;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: "Email already exists"
          }));

        case 9:
          _context.next = 11;
          return regeneratorRuntime.awrap(_bcryptjs["default"].hash(password, 10));

        case 11:
          hashed = _context.sent;
          _context.next = 14;
          return regeneratorRuntime.awrap(_User["default"].create({
            name: name,
            email: email,
            password: hashed,
            role: role
          }));

        case 14:
          res.json({
            message: "".concat(role, " registered successfully!")
          });
          _context.next = 20;
          break;

        case 17:
          _context.prev = 17;
          _context.t0 = _context["catch"](0);
          res.status(500).json({
            message: _context.t0.message
          });

        case 20:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 17]]);
}); // LOGIN WITH ROLE VALIDATION

router.post("/login", function _callee2(req, res) {
  var _req$body2, email, password, role, user, match, token;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _req$body2 = req.body, email = _req$body2.email, password = _req$body2.password, role = _req$body2.role;
          _context2.next = 4;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            email: email
          }));

        case 4:
          user = _context2.sent;

          if (user) {
            _context2.next = 7;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: "Invalid credentials"
          }));

        case 7:
          if (!(user.role !== role)) {
            _context2.next = 9;
            break;
          }

          return _context2.abrupt("return", res.status(403).json({
            message: "Role mismatch"
          }));

        case 9:
          _context2.next = 11;
          return regeneratorRuntime.awrap(_bcryptjs["default"].compare(password, user.password));

        case 11:
          match = _context2.sent;

          if (match) {
            _context2.next = 14;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: "Invalid credentials"
          }));

        case 14:
          token = _jsonwebtoken["default"].sign({
            id: user._id,
            role: user.role
          }, process.env.JWT_SECRET);
          res.json({
            token: token,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role
            }
          });
          _context2.next = 21;
          break;

        case 18:
          _context2.prev = 18;
          _context2.t0 = _context2["catch"](0);
          res.status(500).json({
            message: _context2.t0.message
          });

        case 21:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 18]]);
});
var _default = router;
exports["default"] = _default;