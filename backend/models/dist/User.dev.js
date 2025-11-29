"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var UserSchema = new _mongoose["default"].Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    "enum": ["user", "owner", "admin"],
    "default": "user"
  },
  // ⭐ ADD THIS FIELD
  verified: {
    type: Boolean,
    "default": false
  }
}, {
  timestamps: true
});

var _default = _mongoose["default"].model("User", UserSchema);

exports["default"] = _default;