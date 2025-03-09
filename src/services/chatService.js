import { getUserByPhone, createUser } from "./userService.js";
import { bot } from "../config/telegramConfig.js";
import { CONFIG } from "../config/envConfig.js";

const users = new Map();

export const setupChatHandlers = (io) => {
  function escapeMarkdown(text) {
    return text
      .replace(/([_*[\]()~`>#+\-=|{}.!])/g, "\\$1")
      .replace(/_/g, "\\_")
      .replace(/\*/g, "\\*")
      .replace(/\[/g, "\\[")
      .replace(/\]/g, "\\]")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
      .replace(/~/g, "\\~")
      .replace(/`/g, "\\`")
      .replace(/>/g, "\\>")
      .replace(/#/g, "\\#")
      .replace(/\+/g, "\\+")
      .replace(/-/g, "\\-")
      .replace(/=/g, "\\=")
      .replace(/\|/g, "\\|")
      .replace(/\{/g, "\\{")
      .replace(/\}/g, "\\}")
      .replace(/\./g, "\\.")
      .replace(/!/g, "\\!")
      .replace(/\n/g, "\\n");
  }

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
        await bot.sendMessage(
          CONFIG.CHAT_ID_CS,
          `📩 *Pesan Baru dari Pelanggan*\n\n` +
            `👤 *Nama:* \`${escapeMarkdown(user.name)}\`\n` +
            `📞 *Telepon:* \`${escapeMarkdown(user.phone)}\`\n` +
            `✉️ *Email:* \`${escapeMarkdown(user.email)}\`\n\n` +
            `💬 *Pesan:*\n\`\`\`\n${escapeMarkdown(data.text)}\n\`\`\``,
          { parse_mode: "MarkdownV2" }
        );

        socket.to(user.name).emit("receive_message", {
          sender: user.name,
          text: data.text.trim(),
          timestamp: formattedTime,
        });
      } catch (error) {
        socket.emit("error", { message: "Gagal mengirim pesan!" });
      }
    });

    socket.on("chat_ended", () => {
      console.log(
        `🔴 Chat diakhiri untuk ${socket.data?.user?.name || "Unknown User"}`
      );

      io.to(socket.data.roomId).emit("chat_ended", {
        message: "🔴 Chat telah diakhiri oleh CS.",
      });

      setTimeout(() => {
        socket.disconnect();
      }, 1000);
    });

    socket.on("disconnect", () => {
      users.delete(socket.id);
    });
  });
};
