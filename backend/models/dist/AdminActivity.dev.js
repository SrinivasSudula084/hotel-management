"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// backend/models/AdminActivity.js
var adminActivitySchema = new _mongoose["default"].Schema({
  adminId: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Admin",
    required: false
  },
  adminEmail: {
    type: String
  },
  // helpful if admin model not used
  action: {
    type: String,
    required: true
  },
  // e.g., "block_user"
  resource: {
    type: String
  },
  // e.g., "user"
  resourceId: {
    type: String
  }
}, {
  timestamps: true
});

var _default = _mongoose["default"].model("AdminActivity", adminActivitySchema);

exports["default"] = _default;