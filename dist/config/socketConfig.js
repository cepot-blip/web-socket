"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setupSocket = void 0;
var _socket = require("socket.io");
var setupSocket = exports.setupSocket = function setupSocket(server) {
  var io = new _socket.Server(server, {
    cors: {
      origin: "*"
    }
  });
  return io;
};