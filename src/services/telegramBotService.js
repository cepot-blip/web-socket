import { bot } from "../config/telegramConfig.js";
import { CONFIG } from "../config/envConfig.js";
import { io } from "../config/socketConfig.js"; // Pastikan `io` diekspor dari `socketConfig.js`

const activeChats = new Map();

bot.on("message", async (msg) => {
  console.log("\uD83D\uDCEC Pesan masuk dari Telegram:", msg);

  const chatId = msg.chat?.id;
  if (!chatId) {
    console.error("❌ ERROR: chatId tidak ditemukan dalam pesan!");
    return;
  }

  console.log("\uD83D\uDCEC Chat ID dari pesan:", chatId);
  console.log("\uD83D\uDCEC Chat ID CS dari config:", CONFIG.CHAT_ID_CS);

  if (parseInt(chatId) !== parseInt(CONFIG.CHAT_ID_CS)) {
    console.log("⛔ Pesan bukan dari chat CS, diabaikan!");
    return;
  }

  if (!msg.text) {
    console.log("⚠️ Tidak ada teks dalam pesan, diabaikan.");
    return;
  }

  const text = msg.text.trim();
  console.log("✅ Teks pesan:", text);

  if (text.startsWith("/endchat")) {
    const match = text.match(/^\/endchat\s+@([\w\s]+)$/);
    if (!match || !match[1]) {
      bot.sendMessage(
        CONFIG.CHAT_ID_CS,
        "❌ Format salah! Gunakan: `/endchat @username`"
      );
      return;
    }

    const userName = match[1].trim().toLowerCase();

    if (!activeChats.has(userName)) {
      bot.sendMessage(
        CONFIG.CHAT_ID_CS,
        `❌ Tidak ditemukan chat aktif dengan @${userName}`
      );
      return;
    }

    const socketId = activeChats.get(userName);
    if (!io || !io.sockets || !io.sockets.sockets) {
      console.error("❌ ERROR: WebSocket IO tidak tersedia!");
      return;
    }

    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      io.to(socketId).emit("chat_ended", {
        message: "🔴 Chat telah diakhiri oleh CS.",
      });

      bot.sendMessage(
        CONFIG.CHAT_ID_CS,
        `✅ Chat dengan @${userName} telah diakhiri.`
      );

      setTimeout(() => {
        if (socket.connected) {
          socket.disconnect();
        }
      }, 500);
    }

    activeChats.delete(userName);
    return;
  }

  const match = text.match(/^@([\w\s]+?)\s+(.+)/);
  if (!match || !match[1] || !match[2]) {
    bot.sendMessage(
      CONFIG.CHAT_ID_CS,
      "❌ Format pesan salah! Gunakan: `@username pesan`"
    );
    return;
  }

  const userName = match[1].trim().toLowerCase();
  const messageContent = match[2];

  if (!io || !io.sockets || !io.sockets.sockets) {
    console.error("❌ ERROR: WebSocket IO tidak tersedia!");
    bot.sendMessage(CONFIG.CHAT_ID_CS, "❌ ERROR: WebSocket tidak tersedia!");
    return;
  }

  let userFound = false;

  for (const socket of Array.from(io.sockets.sockets.values())) {
    console.log(
      "🔍 Memeriksa socket:",
      socket.id,
      "Data user:",
      socket.data?.user
    );
    const user = socket.data?.user;
    if (!user) continue;

    console.log(
      "🔍 Membandingkan:",
      user.name.toLowerCase(),
      "dengan",
      userName
    );
    if (user.name.toLowerCase() === userName) {
      io.to(socket.id).emit("receive_message", {
        sender: "Customer Service",
        text: messageContent,
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      });

      bot.sendMessage(CONFIG.CHAT_ID_CS, `✅ Pesan terkirim ke @${userName}`);
      activeChats.set(userName, socket.id);
      userFound = true;
      break;
    }
  }

  if (!userFound) {
    bot.sendMessage(CONFIG.CHAT_ID_CS, `❌ Gagal menemukan user @${userName}`);
  }
});

bot.on("error", (error) => {
  console.error("❌ Bot Error:", error.message);
});
