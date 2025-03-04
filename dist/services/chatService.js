"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setupChatHandlers = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _userService = require("./userService.js");
var _telegramConfig = require("../config/telegramConfig.js");
var _envConfig = require("../config/envConfig.js");
var users = new Map();
var setupChatHandlers = exports.setupChatHandlers = function setupChatHandlers(io) {
  io.on("connection", function (socket) {
    socket.on("register_user", /*#__PURE__*/function () {
      var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(userData) {
        var user;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return (0, _userService.getUserByPhone)(userData.phone);
            case 2:
              user = _context.sent;
              if (user) {
                _context.next = 7;
                break;
              }
              _context.next = 6;
              return (0, _userService.createUser)({
                name: userData.name.toLowerCase(),
                phone: userData.phone,
                email: userData.email || null
              });
            case 6:
              user = _context.sent;
            case 7:
              socket.data.user = user;
              users.set(socket.id, user);
              socket.join(user.name);
              socket.emit("registered", {
                success: true,
                user: user
              });
            case 11:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
    socket.on("request_pre_chat", function () {
      socket.emit("pre_chat_options", {
        options: ["Cara join mitra?", "Cara join B2C?", "Cara join B2B?", "Softwarehouse", "Hubungi CS", "Kembali Ke Menu Utama"]
      });
    });
    socket.on("pre_chat_selection", function (data) {
      var user = users.get(socket.id);
      if (!user) {
        return socket.emit("error", {
          message: "User tidak terdaftar!"
        });
      }
      if (data.option === "Hubungi CS") {
        socket.emit("chat_start", {
          message: "Anda sekarang terhubung dengan CS."
        });
      } else {
        var responses = {
          "Cara join mitra?": "Untuk menjadi mitra, silakan daftar di website kami...",
          "Cara join B2C?": "B2C memungkinkan pelanggan membeli langsung, info lebih lanjut di website...",
          "Cara join B2B?": "B2B ditujukan untuk bisnis yang ingin bermitra dengan kami...",
          Softwarehouse: "Kami menyediakan layanan software house, detailnya di website kami..."
        };
        socket.emit("pre_chat_response", {
          message: responses[data.option] || "Mohon pilih pertanyaan yang tersedia."
        });
      }
    });
    socket.on("send_message", /*#__PURE__*/function () {
      var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(data) {
        var user, formattedTime;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              user = users.get(socket.id);
              if (user) {
                _context2.next = 3;
                break;
              }
              return _context2.abrupt("return", socket.emit("error", {
                message: "User tidak terdaftar!"
              }));
            case 3:
              if (!(!data.text || data.text.trim() === "")) {
                _context2.next = 5;
                break;
              }
              return _context2.abrupt("return", socket.emit("error", {
                message: "Pesan tidak boleh kosong!"
              }));
            case 5:
              formattedTime = new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
              });
              _context2.prev = 6;
              _context2.next = 9;
              return _telegramConfig.bot.sendMessage(_envConfig.CONFIG.CHAT_ID_CS, "\uD83D\uDCE9 Pesan Baru dari Pelanggan \n\n\uD83D\uDC64 Nama: ".concat(user.name, "\n\uD83D\uDCDE Telepon: ").concat(user.phone, "\n\u2709\uFE0F Email: ").concat(user.email, "\n\uD83D\uDCAC Pesan: ").concat(data.text.trim()));
            case 9:
              socket.to(user.name).emit("receive_message", {
                sender: user.name,
                text: data.text.trim(),
                timestamp: formattedTime
              });
              _context2.next = 15;
              break;
            case 12:
              _context2.prev = 12;
              _context2.t0 = _context2["catch"](6);
              socket.emit("error", {
                message: "Gagal mengirim pesan!"
              });
            case 15:
            case "end":
              return _context2.stop();
          }
        }, _callee2, null, [[6, 12]]);
      }));
      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    }());
    socket.on("chat_ended", function () {
      var _socket$data;
      console.log("\uD83D\uDD34 Chat diakhiri untuk ".concat(((_socket$data = socket.data) === null || _socket$data === void 0 || (_socket$data = _socket$data.user) === null || _socket$data === void 0 ? void 0 : _socket$data.name) || "Unknown User"));
      io.to(socket.data.roomId).emit("chat_ended", {
        message: "🔴 Chat telah diakhiri oleh CS."
      });
      setTimeout(function () {
        socket.disconnect();
      }, 1000);
    });
    socket.on("disconnect", function () {
      users["delete"](socket.id);
    });
  });
};