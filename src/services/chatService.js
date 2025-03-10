import { getUserByPhone, createUser } from "./userService.js";
import { bot } from "../config/telegramConfig.js";
import { CONFIG } from "../config/envConfig.js";

const users = new Map();

export const setupChatHandlers = (io) => {
  io.on("connection", (socket) => {
    socket.on("register_user", async (userData) => {
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
      socket.join(user.name);
      socket.emit("registered", { success: true, user });
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
        if (!CONFIG.CHAT_ID_CS) {
          console.error("❌ Error: CHAT_ID_CS tidak ditemukan! Cek file .env");
          return socket.emit("error", {
            message: "Server error: Chat ID tidak ditemukan",
          });
        }

        await bot.sendMessage(
          CONFIG.CHAT_ID_CS,
          `📩 <b>Pesan Baru dari Pelanggan</b>\n\n` +
            `👤 <b>Nama:</b> <code>${user.name}</code>\n` +
            `📞 <b>Telepon:</b> <code>${user.phone}</code>\n` +
            `✉️ <b>Email:</b> <code>${
              user.email || "Tidak tersedia"
            }</code>\n\n` +
            `💬 <b>Pesan:</b>\n<code>${data.text.replace(
              /\n/g,
              "&#10;"
            )}</code>`,
          { parse_mode: "HTML" }
        );

        console.log(
          "Pesan sebelum dikirim ke Telegram:",
          JSON.stringify(data.text)
        );

        io.to(user.name).emit("receive_message", {
          sender: user.name,
          text: data.text,
          timestamp: formattedTime,
        });
      } catch (error) {
        console.error("❌ Gagal mengirim pesan:", error);
        socket.emit("error", { message: "Gagal mengirim pesan!" });
      }
    });

    socket.on("chat_ended", () => {
      console.log(
        `🔴 Chat diakhiri untuk ${socket.data?.user?.name || "Unknown User"}`
      );

      io.to(socket.data.user?.name).emit("chat_ended", {
        message: "🔴 Chat telah diakhiri oleh CS.",
      });

      setTimeout(() => {
        socket.disconnect();
      }, 1000);
    });

    socket.on("disconnect", () => {
      console.log("❌ WebSocket Disconnected:", socket.id);
      users.delete(socket.id);
    });
  });
};
