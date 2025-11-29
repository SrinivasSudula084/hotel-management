"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var hotelSchema = new _mongoose["default"].Schema({
  owner: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    required: true,
    index: "text"
  },
  description: {
    type: String
  },
  location: {
    city: {
      type: String,
      index: true
    },
    state: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  images: [String],
  rooms: [{
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Room"
  }],
  avgRating: {
    type: Number,
    "default": 0
  },
  ratingsCount: {
    type: Number,
    "default": 0
  },
  // ⭐ ADD THIS FIELD
  approved: {
    type: Boolean,
    "default": false
  },
  createdAt: {
    type: Date,
    "default": Date.now
  }
}); // text index

hotelSchema.index({
  name: "text",
  description: "text"
});

var _default = _mongoose["default"].model("Hotel", hotelSchema);

exports["default"] = _default;