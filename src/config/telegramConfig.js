import TelegramBot from "node-telegram-bot-api";
import { CONFIG } from "./envConfig.js";

export const bot = new TelegramBot(CONFIG.TELEGRAM_BOT_TOKEN, {
  polling: true,
});

bot.on("polling_error", (error) => {
  console.error("❌ Polling Error:", error.message);
  if (error.code === "EFATAL") {
    console.log("🔄 Mencoba reconnect ke Telegram...");
    setTimeout(() => {
      bot.startPolling();
    }, 5000);
  }
});
