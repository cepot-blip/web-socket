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

    socket.on("request_pre_chat", () => {
      socket.emit("pre_chat_options", {
        options: [
          "Cara join mitra?",
          "Cara join B2C?",
          "Cara join B2B?",
          "Softwarehouse",
          "Hubungi CS",
          "Kembali Ke Menu Utama",
        ],
      });
    });

    socket.on("pre_chat_selection", (data) => {
      const user = users.get(socket.id);
      if (!user) {
        return socket.emit("error", { message: "User tidak terdaftar!" });
      }

      if (data.option === "Hubungi CS") {
        socket.emit("chat_start", {
          message: "Anda sekarang terhubung dengan CS.",
        });
      } else {
        const responses = {
          "Cara join mitra?":
            "Untuk menjadi mitra, silakan daftar di website kami...",
          "Cara join B2C?":
            "B2C memungkinkan pelanggan membeli langsung, info lebih lanjut di website...",
          "Cara join B2B?":
            "B2B ditujukan untuk bisnis yang ingin bermitra dengan kami...",
          Softwarehouse:
            "Kami menyediakan layanan software house, detailnya di website kami...",
        };
        socket.emit("pre_chat_response", {
          message:
            responses[data.option] || "Mohon pilih pertanyaan yang tersedia.",
        });
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

      const formattedTime = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      try {
        await bot.sendMessage(
          CONFIG.CHAT_ID_CS,
          `👤 ${user.name} (${user.phone})\n💬 ${data.text.trim()}`
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
      socket.emit("chat_ended", { message: "🔴 Chat telah diakhiri oleh CS." });
      socket.disconnect();
    });

    socket.on("disconnect", () => {
      users.delete(socket.id);
      console.log("❌ User disconnected:", socket.id);
    });
  });
};
