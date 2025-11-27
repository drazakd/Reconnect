// src/models/ContactModel.js
import pool from "../config/db.js";

const ContactModel = {
  // Trouve une relation (n'importe quelle direction) entre 2 users (renvoie 0 ou 1 ligne)
  async findBetween(userA, userB) {
    const [rows] = await pool.query(
      `SELECT * FROM contacts
       WHERE (user_id = ? AND contact_id = ?) OR (user_id = ? AND contact_id = ?)
       LIMIT 1`,
      [userA, userB, userB, userA]
    );
    return rows[0];
  },
  // src/models/ContactModel.js – ajouter une méthode pour retrouver un contact par son ID
  async findById(id) {
    const [rows] = await pool.query(
      `SELECT * FROM contacts WHERE id = ?`,
      [id]
    );
    return rows[0];
  },


  // Demandes entrantes (où current user est contact_id)
  async getIncomingRequests(userId) {
    const [rows] = await pool.query(
      `SELECT c.id, c.created_at,
              u.id AS from_id, u.nom, u.prenom, u.image
       FROM contacts c
       JOIN users u ON u.id = c.user_id
       WHERE c.contact_id = ? AND c.status = 'pending'
       ORDER BY c.created_at DESC`,
      [userId]
    );
    return rows.map(r => ({
      id: r.id,
      created_at: r.created_at,
      from_user: { id: r.from_id, nom: r.nom, prenom: r.prenom, image: r.image }
    }));
  },

  // Demandes envoyées (où current user est user_id)
  async getSentRequests(userId) {
    const [rows] = await pool.query(
      `SELECT c.id, c.created_at, c.status,
              u.id AS to_id, u.nom, u.prenom, u.image
       FROM contacts c
       JOIN users u ON u.id = c.contact_id
       WHERE c.user_id = ? AND c.status = 'pending'
       ORDER BY c.created_at DESC`,
      [userId]
    );
    return rows.map(r => ({
      id: r.id,
      created_at: r.created_at,
      status: r.status,
      to_user: { id: r.to_id, nom: r.nom, prenom: r.prenom, image: r.image }
    }));
  },

  // Amis (status = accepted) — renvoie la row contact + l'autre user
  async getFriends(userId) {
    const [rows] = await pool.query(
      `SELECT c.id, c.created_at,
              IF(c.user_id = ?, c.contact_id, c.user_id) AS other_id,
              u.nom, u.prenom, u.image
       FROM contacts c
       JOIN users u ON u.id = IF(c.user_id = ?, c.contact_id, c.user_id)
       WHERE (c.user_id = ? OR c.contact_id = ?) AND c.status = 'accepted'
       ORDER BY c.created_at DESC`,
      [userId, userId, userId, userId]
    );
    return rows.map(r => ({
      id: r.id,
      since: r.created_at,
      user: { id: r.other_id, nom: r.nom, prenom: r.prenom, image: r.image }
    }));
  },

  // Insert une nouvelle demande (simple, pas symétrique)
  async insertRequest(userId, targetId) {
    const [result] = await pool.query(
      `INSERT INTO contacts (user_id, contact_id, status) VALUES (?, ?, 'pending')`,
      [userId, targetId]
    );
    return result.insertId;
  },

  // Met à jour une demande (par id) en accepted
  async acceptByIdForRecipient(contactId, recipientId) {
    const [result] = await pool.query(
      `UPDATE contacts
       SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND contact_id = ? AND status = 'pending'`,
      [contactId, recipientId]
    );
    return result.affectedRows;
  },

  // Accepter par contact id (utilisé lors auto-accept)
  async acceptById(contactId) {
    const [result] = await pool.query(
      `UPDATE contacts SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'pending'`,
      [contactId]
    );
    return result.affectedRows;
  },

  // Supprimer une demande (decline) — uniquement si contact_id est recipient
  async deletePendingForRecipient(contactId, recipientId) {
    const [result] = await pool.query(
      `DELETE FROM contacts WHERE id = ? AND contact_id = ? AND status = 'pending'`,
      [contactId, recipientId]
    );
    return result.affectedRows;
  },

  // Annuler demande envoyée par sender (delete by contact id and user_id)
  async deletePendingBySender(contactId, userId) {
    const [result] = await pool.query(
      `DELETE FROM contacts WHERE id = ? AND user_id = ? AND status = 'pending'`,
      [contactId, userId]
    );
    return result.affectedRows;
  },

  // Supprimer un ami (accepted) — ensure user is part of the relation
  async deleteAccepted(contactId, userId) {
    const [result] = await pool.query(
      `DELETE FROM contacts WHERE id = ? AND status = 'accepted' AND (user_id = ? OR contact_id = ?)`,
      [contactId, userId, userId]
    );
    return result.affectedRows;
  }
};

export default ContactModel;
