"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleSocketConnection = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _userStore = require("../store/userStore.js");
var _telegramBotService = require("../services/telegramBotService.js");
var _envConfig = require("../config/envConfig.js");
var _client = require("@prisma/client");
var prisma = new _client.PrismaClient();
var handleSocketConnection = exports.handleSocketConnection = function handleSocketConnection(io) {
  io.on("connection", function (socket) {
    socket.on("register_user", /*#__PURE__*/function () {
      var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(userData) {
        var user;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (!(!userData.name || !userData.phone)) {
                _context.next = 2;
                break;
              }
              return _context.abrupt("return", socket.emit("error", {
                message: "Data user tidak lengkap!"
              }));
            case 2:
              _context.prev = 2;
              _context.next = 5;
              return prisma.chatUser.findUnique({
                where: {
                  phone: userData.phone
                }
              });
            case 5:
              user = _context.sent;
              if (user) {
                _context.next = 10;
                break;
              }
              _context.next = 9;
              return prisma.chatUser.create({
                data: {
                  name: userData.name.toLowerCase(),
                  phone: userData.phone,
                  email: userData.email || null
                }
              });
            case 9:
              user = _context.sent;
            case 10:
              _userStore.users.set(socket.id, user);
              socket.join(user.id);
              socket.emit("registered", {
                success: true,
                user: user
              });
              _context.next = 18;
              break;
            case 15:
              _context.prev = 15;
              _context.t0 = _context["catch"](2);
              socket.emit("error", {
                message: "Gagal menyimpan user!"
              });
            case 18:
            case "end":
              return _context.stop();
          }
        }, _callee, null, [[2, 15]]);
      }));
      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
    io.on("connection", function (socket) {
      socket.on("disconnect", function () {
        var _socket$data;
        var user = (_socket$data = socket.data) === null || _socket$data === void 0 ? void 0 : _socket$data.user;
        if (user) {
          activeChats["delete"](user.name.toLowerCase());
        }
      });
    });
    socket.on("send_message", /*#__PURE__*/function () {
      var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(data) {
        var user, formattedTime;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              user = _userStore.users.get(socket.id);
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
              return _telegramBotService.bot.sendMessage(_envConfig.CHAT_ID_CS, "\uD83D\uDC64 ".concat(user.name, " (").concat(user.phone, ")\n\uD83D\uDCAC ").concat(data.text.trim()));
            case 9:
              _context2.next = 11;
              return prisma.message.create({
                data: {
                  senderId: user.id,
                  content: data.text.trim(),
                  timestamp: new Date().toISOString()
                }
              });
            case 11:
              console.log("📤 Mengirim pesan ke CS:", {
                sender: user.name,
                text: data.text.trim(),
                timestamp: formattedTime
              });
              io.to("cs_room").emit("receive_message", {
                sender: user.name,
                text: data.text.trim(),
                timestamp: formattedTime
              });
              _context2.next = 19;
              break;
            case 15:
              _context2.prev = 15;
              _context2.t0 = _context2["catch"](6);
              console.error("❌ Gagal mengirim pesan:", _context2.t0);
              socket.emit("error", {
                message: "Gagal mengirim pesan!"
              });
            case 19:
            case "end":
              return _context2.stop();
          }
        }, _callee2, null, [[6, 15]]);
      }));
      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    }());
    socket.on("disconnect", function () {
      _userStore.users["delete"](socket.id);
    });
  });
  io.on("connection", function (socket) {
    socket.on("register_cs", function () {
      socket.join("cs_room");
      console.log("✅ CS terdaftar:", socket.id);
    });
  });
};