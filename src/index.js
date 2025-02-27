import express from "express";
import { createServer } from "http";
import { setupSocket } from "./services/socketHandler.js";
import { PORT } from "./config/env.js";

const app = express();
const server = createServer(app);

setupSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 WebSocket server berjalan di port ${PORT}`);
});
