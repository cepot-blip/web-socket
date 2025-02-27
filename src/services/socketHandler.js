import { Server } from "socket.io";
import { prisma } from "../config/prisma.js";
import { sendMessageToCS } from "./telegramBot.js";

const users = new Map();

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    socket.on("register_user", async (userData) => {
      if (!userData.name || !userData.phone) {
        return socket.emit("error", { message: "Data user tidak lengkap!" });
      }

      try {
        let user = await prisma.chatUser.findUnique({
          where: { phone: userData.phone },
        });

        if (!user) {
          user = await prisma.chatUser.create({
            data: {
              name: userData.name.toLowerCase(),
              phone: userData.phone,
              email: userData.email || null,
            },
          });
        }

        users.set(socket.id, user);
        socket.join(user.name);
        socket.emit("registered", { success: true, user });
      } catch (error) {
        socket.emit("error", { message: "Gagal menyimpan user!" });
      }
    });

    socket.on("send_message", async (data) => {
      const user = users.get(socket.id);
      if (!user) {
        return socket.emit("error", { message: "User tidak terdaftar!" });
      }

      if (!data.text || data.text.trim() === "") {
        return socket.emit("error", { message: "Pesan tidak boleh kosong!" });
      }

      console.log("📩 Pesan dari user:", data);
      const now = new Date();
      const formattedTime = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      try {
        await sendMessageToCS(
          `👤 ${user.name} (${user.phone})\n💬 ${data.text.trim()}`
        );

        await prisma.message.create({
          data: {
            senderId: user.id,
            content: data.text.trim(),
            timestamp: now.toISOString(),
          },
        });

        io.to(user.name).emit("receive_message", {
          sender: user.name,
          text: data.text.trim(),
          timestamp: formattedTime,
        });
      } catch (error) {
        socket.emit("error", { message: "Gagal mengirim pesan!" });
      }
    });

    socket.on("end_chat", async () => {
      const user = users.get(socket.id);
      if (!user)
        return socket.emit("error", { message: "User tidak ditemukan!" });

      users.delete(socket.id);
      socket.leave(user.name);
      socket.emit("chat_ended", { message: "Chat telah diakhiri oleh Anda." });

      await sendMessageToCS(`⚠️ ${user.name} telah mengakhiri chat.`);
      console.log(`🚫 Chat user ${user.name} berakhir.`);
    });

    socket.on("disconnect", () => {
      users.delete(socket.id);
      console.log("❌ User disconnected:", socket.id);
    });
  });
};
