import dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  CHAT_ID_CS: process.env.CHAT_ID_CS,
};

export const CHAT_ID_CS = process.env.CHAT_ID_CS;
