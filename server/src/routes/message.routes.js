// src/routes/message.routes.js
import express from "express";
import MessageController from "../controllers/MessageController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Toutes les routes messages nécessitent d'être connecté
router.use(authMiddleware);

// Récupérer les messages d’une conversation
// GET /api/conversations/:id/messages
router.get("/conversations/:id/messages", MessageController.getMessages);

// Envoyer un nouveau message
// POST /api/conversations/:id/messages
router.post("/conversations/:id/messages", MessageController.sendMessage);

// Marquer les messages comme lus
// PATCH /api/conversations/:id/messages/read
router.patch("/conversations/:id/messages/read", MessageController.markRead);

export default router;
