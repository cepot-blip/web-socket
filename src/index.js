import express from "express";
import { createServer } from "http";
import { CONFIG } from "./config/envConfig.js";
import { setupSocket } from "./config/socketConfig.js";
import http from "http";
import "./services/telegramBotService.js";
import { handleSocketConnection } from "./sockets/socketHandler.js";

const app = express();
const server = http.createServer(app);
const io = setupSocket(server);
handleSocketConnection(io);

app.get("/", (req, res) => {
  res.send("🔥 Server is running! 🚀 🚀 🚀");
});

server.listen(CONFIG.PORT, () => {
  console.log(`🚀 WebSocket server berjalan di port ${CONFIG.PORT}`);
});
