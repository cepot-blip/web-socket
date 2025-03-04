"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUserByPhone = exports.createUser = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _client = require("@prisma/client");
var prisma = new _client.PrismaClient();
var getUserByPhone = exports.getUserByPhone = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(phone) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          return _context.abrupt("return", prisma.chatUser.findUnique({
            where: {
              phone: phone
            }
          }));
        case 1:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function getUserByPhone(_x) {
    return _ref.apply(this, arguments);
  };
}();
var createUser = exports.createUser = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(data) {
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          return _context2.abrupt("return", prisma.chatUser.create({
            data: data
          }));
        case 1:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return function createUser(_x2) {
    return _ref2.apply(this, arguments);
  };
}();