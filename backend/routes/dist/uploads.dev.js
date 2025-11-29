"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _multer = _interopRequireDefault(require("multer"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = _express["default"].Router(); // Storage Engine


var storage = _multer["default"].diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, "uploads/"); // folder
  },
  filename: function filename(req, file, cb) {
    var unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + _path["default"].extname(file.originalname));
  }
});

var upload = (0, _multer["default"])({
  storage: storage
}); // Upload Route

router.post("/", upload.single("image"), function (req, res) {
  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded"
    });
  } // FINAL PUBLIC URL


  var imageUrl = "".concat(process.env.BASE_URL, "/uploads/").concat(req.file.filename);
  res.json({
    url: imageUrl
  });
});
var _default = router;
exports["default"] = _default;