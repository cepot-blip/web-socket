import { getUserByPhone, createUser } from "./userService.js";
import { bot } from "../config/telegramConfig.js";
import { CONFIG } from "../config/envConfig.js";

const users = new Map();

export const setupChatHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log(`✅ WebSocket Connected: ${socket.id}`);

    socket.on("register_user", async (userData) => {
      try {
        if (!userData.name || !userData.phone) {
          return socket.emit("error", { message: "Data user tidak lengkap!" });
        }

        let user = await getUserByPhone(userData.phone);

        if (!user) {
          user = await createUser({
            name: userData.name.toLowerCase(),
            phone: userData.phone,
            email: userData.email || null,
          });
        }

        socket.data.user = user;
        users.set(socket.id, user);
        socket.join(user.id);
        socket.emit("registered", { success: true, user });
      } catch (error) {
        console.error("❌ Error saat register:", error);
        socket.emit("error", { message: "Gagal mendaftarkan user!" });
      }
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

        const formattedTime = new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

        if (!CONFIG.CHAT_ID_CS) {
          return socket.emit("error", {
            message: "Server error: Chat ID tidak ditemukan",
          });
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

        io.to(user.id).emit("receive_message", {
          sender: user.name,
          text: data.text.replace(/\r\n/g, "\n").replace(/\r/g, "\n"),
          timestamp: formattedTime,
        });
      } catch (error) {
        console.error("❌ Gagal mengirim pesan:", error);
        socket.emit("error", { message: "Gagal mengirim pesan!" });
      }
    });

    socket.on("chat_ended", () => {
      const user = socket.data.user;
      if (user) {
        console.log(`🔴 Chat diakhiri untuk ${user.name}`);
        io.to(user.id).emit("chat_ended", {
          message: "🔴 Chat telah diakhiri oleh CS.",
        });

        setTimeout(() => {
          socket.disconnect();
        }, 1000);
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
