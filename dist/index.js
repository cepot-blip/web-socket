"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.io = void 0;
var _express = _interopRequireDefault(require("express"));
var _http = require("http");
var _envConfig = require("./config/envConfig.js");
var _socketConfig = require("./config/socketConfig.js");
var _chatService = require("./services/chatService.js");
require("./services/telegramBotService.js");
var app = (0, _express["default"])();
var server = (0, _http.createServer)(app);
var io = exports.io = (0, _socketConfig.setupSocket)(server);
(0, _chatService.setupChatHandlers)(io);
server.listen(_envConfig.CONFIG.PORT, function () {
  console.log("\uD83D\uDE80 WebSocket server berjalan di port ".concat(_envConfig.CONFIG.PORT));
});