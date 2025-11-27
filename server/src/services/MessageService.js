// server/src/services/MessageService.js
import pool from "../config/db.js"; // ✅ Manquait
import MessageModel from "../models/MessageModel.js";
import ConversationModel from "../models/ConversationModel.js";

async function getMessages(conversationId, userId) {
  // ✅ Vérifie que l’utilisateur fait bien partie de cette conversation
  const [access] = await pool.query(
    'SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
    [conversationId, userId]
  );

  if (access.length === 0) {
    throw new Error("Accès non autorisé à cette conversation");
  }

  // ✅ Récupère les messages
  const messages = await MessageModel.getMessages(conversationId);

  // ✅ Marque les messages comme lus pour cet utilisateur
  await MessageModel.markRead(conversationId, userId);

  return messages;
}

async function sendMessage(conversationId, senderId, content) {
  if (!content || content.trim() === '') {
    throw new Error("Le message ne peut pas être vide");
  }

  // Vérifie l’accès
  const [access] = await pool.query(
    'SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
    [conversationId, senderId]
  );

  if (access.length === 0) {
    throw new Error("Accès non autorisé à cette conversation");
  }

  // ✅ Crée le message
  const message = await MessageModel.create(conversationId, senderId, content);

  // ✅ Met à jour la date de la conversation
  await pool.query(
    'UPDATE conversations SET updated_at = NOW() WHERE id = ?',
    [conversationId]
  );

  return message;
}

export default {
  getMessages,
  sendMessage,
  markRead: MessageModel.markRead
};
