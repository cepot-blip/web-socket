import { users } from "../store/userStore.js";
import { CONFIG } from "../config/envConfig.js";
import { PrismaClient } from "@prisma/client";
import { bot } from "../config/telegramConfig.js";

const prisma = new PrismaClient();

export const handleSocketConnection = (io) => {
  io.on("connection", (socket) => {
    console.log(`✅ WebSocket Connected: ${socket.id}`);

    socket.on("register_user", async (userData) => {
      try {
        if (!userData.name || !userData.phone) {
          return socket.emit("error", { message: "Data user tidak lengkap!" });
        }

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
        console.error("❌ Error saat register:", error);
        socket.emit("error", { message: "Gagal menyimpan user!" });
      }
    });

    socket.on("register_cs", () => {
      socket.join("cs_room");
    });

    socket.on("send_message", async (data) => {
      try {
        const user = users.get(socket.id);
        if (!user) {
          return socket.emit("error", { message: "User tidak terdaftar!" });
        }

        if (!data.text || data.text.trim() === "") {
          return socket.emit("error", { message: "Pesan tidak boleh kosong!" });
        }

        await bot.sendMessage(
          CONFIG.CHAT_ID_CS,
          `📩 <b>Pesan Baru dari Pelanggan</b>\n\n` +
            `👤 <b>Nama:</b> <code>${user.name}</code>\n` +
            `📞 <b>Telepon:</b> <code>${user.phone}</code>\n` +
            `✉️ <b>Email:</b> <code>${user.email}</code>\n\n` +
            `💬 <b>Pesan:</b>\n<pre>${data.text}</pre>`,
          { parse_mode: "HTML" }
        );

        await prisma.message.create({
          data: {
            senderId: user.id,
            content: data.text,
            timestamp: new Date().toISOString(),
          },
        });

        io.to("cs_room").emit("receive_message", {
          sender: user.name,
          text: data.text.replace(/\r\n/g, "\n").replace(/\r/g, "\n"),
          timestamp: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
        });
      } catch (error) {
        console.error("❌ Gagal mengirim pesan:", error);
        socket.emit("error", { message: "Gagal mengirim pesan!" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ WebSocket Disconnected: ${socket.id}`);
      const user = users.get(socket.id);
      if (user) {
        socket.leave(user.id);
      }
      users.delete(socket.id);
    });
  });
};
