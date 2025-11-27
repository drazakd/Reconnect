// Server/src/socket.js
import { Server as SocketIO } from "socket.io";
import jwt from "jsonwebtoken";
import MessageService from "./services/MessageService.js";
import { JWT_SECRET } from "./config/env.js";
import pool from "./config/db.js";

export default function setupSocket(server) {
  const io = new SocketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Token manquant"));

    try {
      const user = jwt.verify(token, JWT_SECRET);
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Token invalide"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🟢 Socket connecté - User ID: ${socket.user.id}`);

    socket.on("join", (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.user.id} a rejoint la conversation ${conversationId}`);
    });

    socket.on("sendMessage", async ({ conversationId, text }) => {
      try {
        console.log(`📨 Message reçu:`, { conversationId, text, userId: socket.user.id });
        
        const message = await MessageService.sendMessage(conversationId, socket.user.id, text);
        
        const payload = {
          id: message.id,
          conversationId,
          senderId: socket.user.id,
          text: message.content,
          timestamp: message.created_at,
        };
        
        console.log(`📤 Envoi du message à la room ${conversationId}`);
        io.to(conversationId).emit("newMessage", payload);
      } catch (err) {
        console.error("❌ Erreur lors de l'envoi du message:", err.message);
        socket.emit("messageError", { error: err.message });
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket déconnecté - User ID: ${socket.user.id}`);
    });
  });
}