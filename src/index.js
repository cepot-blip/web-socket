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

server.listen(CONFIG.PORT, () => {
  console.log(`🚀 WebSocket server berjalan di port ${CONFIG.PORT}`);
});
