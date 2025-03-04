import express from "express";
import { createServer } from "http";
import { CONFIG } from "./config/envConfig.js";
import { setupSocket } from "./config/socketConfig.js";
import { setupChatHandlers } from "./services/chatService.js";
import "./services/telegramBotService.js";

const app = express();
const server = createServer(app);
export const io = setupSocket(server);

setupChatHandlers(io);

server.listen(CONFIG.PORT, "0.0.0.0", () => {
  console.log(`🚀 WebSocket server berjalan di 0.0.0.0:${CONFIG.PORT}`);
});

app.get("/", (req, res) => {
  res.send("🔥Server is running!🚀 🚀 🚀 ");
});
