"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bot = void 0;
var _nodeTelegramBotApi = _interopRequireDefault(require("node-telegram-bot-api"));
var _envConfig = require("./envConfig.js");
var bot = exports.bot = new _nodeTelegramBotApi["default"](_envConfig.CONFIG.TELEGRAM_BOT_TOKEN, {
  polling: true
});
bot.on("polling_error", function (error) {
  console.error("❌ Polling Error:", error.message);
  if (error.code === "EFATAL") {
    console.log("🔄 Mencoba reconnect ke Telegram...");
    setTimeout(function () {
      bot.startPolling();
    }, 5000);
  }
});