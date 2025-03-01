import TelegramBot from "node-telegram-bot-api";
import { CONFIG } from "./envConfig.js";

export const bot = new TelegramBot(CONFIG.TELEGRAM_BOT_TOKEN, {
  polling: true,
});
