import { users } from "../store/userStore.js";
import { bot } from "../services/telegramBotService.js";
import { CHAT_ID_CS } from "../config/envConfig.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const handleSocketConnection = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 WebSocket Connected:", socket.id);

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
        socket.join(user.id);
        socket.emit("registered", { success: true, user });
      } catch (error) {
        socket.emit("error", { message: "Gagal menyimpan user!" });
      }
    });

    socket.on("register_cs", () => {
      socket.join("cs_room");
      console.log("✅ CS terdaftar:", socket.id);
    });

    socket.on("send_message", async (data) => {
      const user = users.get(socket.id);
      if (!user) {
        return socket.emit("error", { message: "User tidak terdaftar!" });
      }
      if (!data.text || data.text.trim() === "") {
        return socket.emit("error", { message: "Pesan tidak boleh kosong!" });
      }

      const formattedTime = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      try {
        await bot.sendMessage(
          CHAT_ID_CS,
          `👤 ${user.name} (${user.phone})\n💬 ${data.text.trim()}`
        );

        await prisma.message.create({
          data: {
            senderId: user.id,
            content: data.text.trim(),
            timestamp: new Date().toISOString(),
          },
        });

        console.log("📤 Mengirim pesan ke CS:", {
          sender: user.name,
          text: data.text.trim(),
          timestamp: formattedTime,
        });

        io.to("cs_room").emit("receive_message", {
          sender: user.name,
          text: data.text.trim(),
          timestamp: formattedTime,
        });
      } catch (error) {
        console.error("❌ Gagal mengirim pesan:", error);
        socket.emit("error", { message: "Gagal mengirim pesan!" });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ WebSocket Disconnected:", socket.id);
      users.delete(socket.id);
    });
  });
};
