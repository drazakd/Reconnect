// src/lib/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

let socket = null;

export const connectSocket = (token) => {
  if (!token) {
    console.warn("Aucun token fourni pour Socket.IO");
    return null;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    withCredentials: true,
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("🟢 Connecté à Socket.IO");
  });

  socket.on("disconnect", () => {
    console.log("🔴 Déconnecté de Socket.IO");
  });

  socket.on("connect_error", (err) => {
    console.error("Erreur de connexion Socket.IO:", err.message);
  });

  return socket;
};

export const getSocket = () => socket;