// server/src/routes/conversation.routes.js
import { Router } from "express";
import ConversationController from "../controllers/ConversationController.js";
import MessageController from "../controllers/MessageController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();
router.use(authMiddleware);

// Liste des conversations de l'utilisateur
router.get("/conversations", ConversationController.getConversations);

// ✅ Création ou récupération de conversation
router.post("/conversations", ConversationController.createConversation);

// Messages d'une conversation spécifique
router.get("/:id/messages", MessageController.getMessages);

// Envoyer un message dans la conversation
router.post("/:id/messages", MessageController.sendMessage);

// Marquer tous les messages de la conversation comme lus
router.patch("/:id/messages/read", MessageController.markRead);

export default router;
