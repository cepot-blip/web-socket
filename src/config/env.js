import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 5000;
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
export const CHAT_ID_CS = process.env.CHAT_ID_CS
  ? parseInt(process.env.CHAT_ID_CS, 10)
  : NaN;

if (!TELEGRAM_BOT_TOKEN || isNaN(CHAT_ID_CS)) {
  console.error(
    "❌ Error: TELEGRAM_BOT_TOKEN atau CHAT_ID_CS tidak ditemukan!"
  );
  process.exit(1);
}
