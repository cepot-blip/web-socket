import TelegramBot from "node-telegram-bot-api";
import { TELEGRAM_BOT_TOKEN, CHAT_ID_CS } from "../config/env.js";

export const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

export const sendMessageToCS = async (message) => {
  try {
    await bot.sendMessage(CHAT_ID_CS, message);
  } catch (error) {
    console.error("❌ Gagal mengirim pesan ke CS:", error);
  }
};
