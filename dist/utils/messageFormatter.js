"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatTime = void 0;
var formatTime = exports.formatTime = function formatTime() {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
};