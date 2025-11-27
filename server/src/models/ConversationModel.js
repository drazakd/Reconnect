// server/src/models/ConversationModel.js
import pool from "../config/db.js";

const ConversationModel = {
  async getByUser(userId) {
    const [rows] = await pool.query(
      `SELECT c.id, u.id AS otherId, u.nom, u.prenom, u.image
       FROM conversations c
       JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = ?
       JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id != ?
       JOIN users u ON u.id = cp2.user_id
       ORDER BY c.updated_at DESC`,
      [userId, userId]
    );
    return rows;
  },

  // Chercher un participant existant
  async findByParticipants(userId1, userId2) {
    return pool.query(
      `SELECT c.id 
       FROM conversations c
       JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = ?
       JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = ?`,
      [userId1, userId2]
    );
  },

  //créer une nouvelle conversation
  async create(userId1, userId2) {
    const [result] = await pool.query(
      "INSERT INTO conversations (created_at, updated_at) VALUES (NOW(), NOW())"
    );
    const conversationId = result.insertId;

    // Ajouter les participants
    await pool.query(
      "INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)",
      [conversationId, userId1, conversationId, userId2]
    );

    return conversationId;
  },
};

export default ConversationModel;





// import pool from "../config/db.js";

// const ConversationModel = {
//   async getByUser(userId) {
//     const [rows] = await pool.query(
//       `SELECT c.id, u.id AS otherId, u.nom, u.prenom, u.image
//        FROM conversations c
//        JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = ?
//        JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id != ?
//        JOIN users u ON u.id = cp2.user_id
//        ORDER BY c.updated_at DESC`,
//       [userId, userId]
//     );
//     return rows;
//   },

//   async findOrCreate(userId1, userId2) {
//     // Chercher une conversation existante
//     const [existing] = await pool.query(
//       `SELECT c.id 
//        FROM conversations c
//        JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = ?
//        JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = ?`,
//       [userId1, userId2]
//     );

//     if (existing.length > 0) {
//       return existing[0].id;
//     }

//     // Créer une nouvelle conversation
//     const [result] = await pool.query(
//       'INSERT INTO conversations (created_at, updated_at) VALUES (NOW(), NOW())'
//     );
//     const conversationId = result.insertId;

//     // Ajouter les participants
//     await pool.query(
//       'INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)',
//       [conversationId, userId1, conversationId, userId2]
//     );

//     return conversationId;
//   }
// };

// export default ConversationModel;