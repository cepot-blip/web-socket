"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _telegramConfig = require("../config/telegramConfig.js");
var _envConfig = require("../config/envConfig.js");
var _index = require("../index.js");
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var activeChats = new Map();
_telegramConfig.bot.on("message", /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(msg) {
    var chatId, text, _nameRegex, _match, _userName, userFound, _iterator, _step, _loop, _ret, nameRegex, match, userName, messageContent, _iterator2, _step2, _socket$data2, _step2$value, socketId, socket, user;
    return _regenerator["default"].wrap(function _callee$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          chatId = msg.chat.id;
          text = msg.text || "";
          if (!(chatId !== _envConfig.CONFIG.CHAT_ID_CS)) {
            _context2.next = 4;
            break;
          }
          return _context2.abrupt("return");
        case 4:
          if (!text.startsWith("/endchat")) {
            _context2.next = 34;
            break;
          }
          _nameRegex = /^\/endchat\s+@([\w\s]+)$/;
          _match = text.match(_nameRegex);
          if (_match) {
            _context2.next = 10;
            break;
          }
          _telegramConfig.bot.sendMessage(_envConfig.CONFIG.CHAT_ID_CS, "❌ Format salah! Gunakan: `/endchat @username`");
          return _context2.abrupt("return");
        case 10:
          _userName = _match[1].trim().toLowerCase();
          userFound = false;
          _iterator = _createForOfIteratorHelper(_index.io.sockets.sockets);
          _context2.prev = 13;
          _loop = /*#__PURE__*/_regenerator["default"].mark(function _loop() {
            var _socket$data;
            var _step$value, socketId, socket, user;
            return _regenerator["default"].wrap(function _loop$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  _step$value = (0, _slicedToArray2["default"])(_step.value, 2), socketId = _step$value[0], socket = _step$value[1];
                  user = (_socket$data = socket.data) === null || _socket$data === void 0 ? void 0 : _socket$data.user;
                  if (user) {
                    _context.next = 4;
                    break;
                  }
                  return _context.abrupt("return", 0);
                case 4:
                  console.log("Checking socket: ".concat(socketId, ", user:"), user);
                  if (!(user.name.toLowerCase() === _userName)) {
                    _context.next = 12;
                    break;
                  }
                  activeChats["delete"](_userName);
                  _index.io.to(socketId).emit("chat_ended", {
                    message: "🔴 Chat telah diakhiri oleh CS."
                  });
                  _telegramConfig.bot.sendMessage(_envConfig.CONFIG.CHAT_ID_CS, "\u2705 Chat dengan @".concat(_userName, " telah diakhiri."));
                  setTimeout(function () {
                    socket.disconnect();
                  }, 500); // Delay sebelum disconnect

                  userFound = true;
                  return _context.abrupt("return", 1);
                case 12:
                case "end":
                  return _context.stop();
              }
            }, _loop);
          });
          _iterator.s();
        case 16:
          if ((_step = _iterator.n()).done) {
            _context2.next = 25;
            break;
          }
          return _context2.delegateYield(_loop(), "t0", 18);
        case 18:
          _ret = _context2.t0;
          if (!(_ret === 0)) {
            _context2.next = 21;
            break;
          }
          return _context2.abrupt("continue", 23);
        case 21:
          if (!(_ret === 1)) {
            _context2.next = 23;
            break;
          }
          return _context2.abrupt("break", 25);
        case 23:
          _context2.next = 16;
          break;
        case 25:
          _context2.next = 30;
          break;
        case 27:
          _context2.prev = 27;
          _context2.t1 = _context2["catch"](13);
          _iterator.e(_context2.t1);
        case 30:
          _context2.prev = 30;
          _iterator.f();
          return _context2.finish(30);
        case 33:
          if (!userFound) {
            _telegramConfig.bot.sendMessage(_envConfig.CONFIG.CHAT_ID_CS, "\u274C Tidak ditemukan user dengan nama @".concat(_userName));
          }
        case 34:
          nameRegex = /^@([\w\s]+?)\s+(.+)/;
          match = text.match(nameRegex);
          if (match) {
            _context2.next = 39;
            break;
          }
          _telegramConfig.bot.sendMessage(_envConfig.CONFIG.CHAT_ID_CS, "❌ Format pesan salah! Gunakan: `@username pesan`");
          return _context2.abrupt("return");
        case 39:
          userName = match[1].trim().toLowerCase();
          messageContent = match[2];
          _iterator2 = _createForOfIteratorHelper(_index.io.sockets.sockets);
          _context2.prev = 42;
          _iterator2.s();
        case 44:
          if ((_step2 = _iterator2.n()).done) {
            _context2.next = 56;
            break;
          }
          _step2$value = (0, _slicedToArray2["default"])(_step2.value, 2), socketId = _step2$value[0], socket = _step2$value[1];
          user = (_socket$data2 = socket.data) === null || _socket$data2 === void 0 ? void 0 : _socket$data2.user;
          if (user) {
            _context2.next = 49;
            break;
          }
          return _context2.abrupt("continue", 54);
        case 49:
          if (!(user.name.toLowerCase() === userName)) {
            _context2.next = 54;
            break;
          }
          _index.io.to(socketId).emit("receive_message", {
            sender: "Customer Service",
            text: messageContent,
            timestamp: new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
            })
          });
          _telegramConfig.bot.sendMessage(_envConfig.CONFIG.CHAT_ID_CS, "\u2705 Pesan terkirim ke @".concat(userName));
          activeChats.set(userName, socketId);
          return _context2.abrupt("return");
        case 54:
          _context2.next = 44;
          break;
        case 56:
          _context2.next = 61;
          break;
        case 58:
          _context2.prev = 58;
          _context2.t2 = _context2["catch"](42);
          _iterator2.e(_context2.t2);
        case 61:
          _context2.prev = 61;
          _iterator2.f();
          return _context2.finish(61);
        case 64:
          _telegramConfig.bot.sendMessage(_envConfig.CONFIG.CHAT_ID_CS, "\u274C Gagal menemukan user @".concat(userName));
          _telegramConfig.bot.on("error", function (error) {
            console.error("❌ Bot Error:", error.message);
          });
        case 66:
        case "end":
          return _context2.stop();
      }
    }, _callee, null, [[13, 27, 30, 33], [42, 58, 61, 64]]);
  }));
  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());