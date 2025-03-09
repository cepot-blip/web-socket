import { users } from "../store/userStore.js";
import { CONFIG } from "../config/envConfig.js";
import { PrismaClient } from "@prisma/client";
import { bot } from "../config/telegramConfig.js";

const prisma = new PrismaClient();

export const handleSocketConnection = (io) => {
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
      socket.data.user = userData;
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
          `📩 *Pesan Baru dari Pelanggan*\n\n` +
            `👤 *Nama:* \`${escapeMarkdown(user.name)}\`\n` +
            `📞 *Telepon:* \`${escapeMarkdown(user.phone)}\`\n` +
            `✉️ *Email:* \`${escapeMarkdown(user.email)}\`\n\n` +
            `💬 *Pesan:*\n\`\`\`\n${escapeMarkdown(data.text)}\n\`\`\``,
          { parse_mode: "MarkdownV2" }
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
