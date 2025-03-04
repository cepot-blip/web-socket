import express from "express";
import { createServer } from "http";
import { CONFIG } from "./config/envConfig.js";
import { setupSocket } from "./config/socketConfig.js";
import "./services/telegramBotService.js";
import { handleSocketConnection } from "./sockets/socketHandler.js";

const app = express();
const server = createServer(app);
const io = setupSocket(server);

handleSocketConnection(io);

server.listen(CONFIG.PORT, () => {
  console.log(`🚀 WebSocket server berjalan di port ${CONFIG.PORT}`);
});

app.get("/", (req, res) => {
  res.send("🔥 Server is running! 🚀 🚀 🚀");
});
