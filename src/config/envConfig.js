import dotenv from "dotenv";

dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT || 3000,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
  CHAT_ID_CS: process.env.CHAT_ID_CS
    ? parseInt(process.env.CHAT_ID_CS, 10)
    : NaN,
};
