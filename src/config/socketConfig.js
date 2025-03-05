import { Server } from "socket.io";

let io;

export const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`✅ User terhubung: ${socket.id}`);

    socket.on("register", (userData) => {
      socket.data.user = userData;
      console.log(`👤 User terdaftar:`, userData);
    });

    socket.on("disconnect", () => {
      console.log(`❌ User terputus: ${socket.id}`);
    });
  });

  return io;
};

export { io };
