import { bot } from "../config/telegramConfig.js";
import { CONFIG } from "../config/envConfig.js";
import { io } from "../index.js";

const activeChats = new Map();

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  if (chatId !== CONFIG.CHAT_ID_CS) return;

  if (text.startsWith("/endchat")) {
    const nameRegex = /^\/endchat\s+@([\w\s]+)$/;
    const match = text.match(nameRegex);

    if (!match) {
      bot.sendMessage(
        CONFIG.CHAT_ID_CS,
        "❌ Format salah! Gunakan: `/endchat @username`"
      );
      return;
    }

    const userName = match[1].trim().toLowerCase();
    let userFound = false;

    for (const [socketId, socket] of io.sockets.sockets) {
      const user = socket.data?.user;
      if (!user) continue;

      if (user.name.toLowerCase() === userName) {
        activeChats.delete(userName);
        io.to(socketId).emit("chat_ended", {
          message: "🔴 Chat telah diakhiri oleh CS.",
        });

        bot.sendMessage(
          CONFIG.CHAT_ID_CS,
          `✅ Chat dengan @${userName} telah diakhiri.`
        );

        socket.disconnect();
        userFound = true;
        break;
      }
    }

    if (!userFound) {
      bot.sendMessage(
        CONFIG.CHAT_ID_CS,
        `❌ Tidak ditemukan user dengan nama @${userName}`
      );
    }
    return;
  }

  const nameRegex = /^@([\w\s]+?)\s+(.+)/;
  const match = text.match(nameRegex);

  if (!match) {
    bot.sendMessage(
      CONFIG.CHAT_ID_CS,
      "❌ Format pesan salah! Gunakan: `@username pesan`"
    );
    return;
  }

  const userName = match[1].trim().toLowerCase();
  const messageContent = match[2];

  for (const [socketId, socket] of io.sockets.sockets) {
    const user = socket.data?.user;
    if (!user) continue;

    if (user.name.toLowerCase() === userName) {
      io.to(socketId).emit("receive_message", {
        sender: "Customer Service",
        text: messageContent,
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      });

      bot.sendMessage(CONFIG.CHAT_ID_CS, `✅ Pesan terkirim ke @${userName}`);
      activeChats.set(userName, socketId);
      return;
    }
  }

  bot.sendMessage(CONFIG.CHAT_ID_CS, `❌ Gagal menemukan user @${userName}`);
});
