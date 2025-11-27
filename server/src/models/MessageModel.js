// server/src/models/MessageModel.js
import pool from "../config/db.js";

// Récupère tous les messages d'une conversation (triés chronologiquement)
async function getMessages(conversationId) {
  const [rows] = await pool.query(
    `SELECT id, sender_id, content, created_at, is_read
     FROM messages
     WHERE conversation_id = ?
     ORDER BY created_at`,
    [conversationId]
  );
  return rows;
}

// Crée un nouveau message dans la conversation
async function create(conversationId, senderId, content) {
  const [result] = await pool.query(
    `INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)`,
    [conversationId, senderId, content]
  );
  const insertId = result.insertId;
  const [rows] = await pool.query(
    `SELECT id, sender_id, content, created_at FROM messages WHERE id = ?`,
    [insertId]
  );
  return rows[0];
}

// Marque tous les messages non lus de cette conversation (envoyés par l'autre) comme lus
async function markRead(conversationId, userId) {
  const [result] = await pool.query(
    `UPDATE messages
     SET is_read = TRUE
     WHERE conversation_id = ? AND sender_id != ? AND is_read = FALSE`,
    [conversationId, userId]
  );
  return result.affectedRows;
}

// Compte le nombre de messages non lus dans une conversation (envoyés par l'autre utilisateur)
async function countUnread(conversationId, userId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count 
     FROM messages 
     WHERE conversation_id = ? AND is_read = FALSE AND sender_id != ?`,
    [conversationId, userId]
  );
  return rows[0].count;
}

export default { getMessages, create, markRead, countUnread };
