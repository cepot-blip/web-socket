import { Server } from "socket.io";

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  return io;
};
