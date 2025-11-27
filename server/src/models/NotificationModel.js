// src/models/NotificationModel.js
import db from "../config/db.js";

const NotificationModel = {
  async create({ user_id, type, title, body = null, reference_id = null }) {
    const [result] = await db.query(
      `INSERT INTO notifications (user_id, type, title, body, is_read, reference_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [user_id, type, title, body, false, reference_id]
    );

    return {
      id: result.insertId,
      user_id,
      type,
      title,
      body,
      is_read: false,
      reference_id,
    };
  },

  // src/models/NotificationModel.js
  async getByUser(user_id) {
    const [rows] = await db.query(
      `
      SELECT 
        n.id,
        n.type,
        n.title,
        n.body,
        n.is_read,
        n.reference_id AS contact_id,
        n.created_at,
        u.id AS from_user_id,
        u.nom AS from_user_nom,
        u.prenom AS from_user_prenom,
        u.image AS from_user_image
      FROM notifications n
      LEFT JOIN users u 
        ON n.body COLLATE utf8mb4_unicode_ci = CAST(u.id AS CHAR) COLLATE utf8mb4_unicode_ci
        -- si body stocke l'id de l'expéditeur
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      `,
      [user_id]
    );

    return rows.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      is_read: !!n.is_read,
      created_at: n.created_at,
      contact_id: n.contact_id,
      from_user: {
        id: n.from_user_id,
        nom: n.from_user_nom,
        prenom: n.from_user_prenom,
        image: n.from_user_image,
      },
    }));
  },



  async markAsRead(id, userId) {
    await db.query(
      `UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
  },

  async markAllAsRead(userId) {
    await db.query(
      `UPDATE notifications SET is_read = true WHERE user_id = ?`,
      [userId]
    );
  },

  async delete(id, userId) {
    await db.query(
      `DELETE FROM notifications WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
  },
};

export default NotificationModel;
