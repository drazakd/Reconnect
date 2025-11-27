// src/services/ContactService.js
import ContactModel from "../models/ContactModel.js";

const ContactService = {
  getIncomingRequests: (userId) => ContactModel.getIncomingRequests(userId),
  getSentRequests: (userId) => ContactModel.getSentRequests(userId),
  getFriends: (userId) => ContactModel.getFriends(userId),

  // sendRequest: si l'autre a déjà envoyé une demande -> on accepte automatiquement
  async sendRequest(userId, targetId) {
    if (parseInt(userId, 10) === parseInt(targetId, 10)) {
      throw new Error("Vous ne pouvez pas vous envoyer une demande à vous-même");
    }

    // Vérifier s'il existe déjà une relation dans une des directions
    const existing = await ContactModel.findBetween(userId, targetId);
    if (existing) {
      if (existing.status === "accepted") {
        throw new Error("Vous êtes déjà amis");
      }
      // s'il existe une demande en attente
      if (existing.status === "pending") {
        if (existing.user_id === targetId && existing.contact_id === userId) {
          // l'autre nous a envoyé une demande -> on accepte automatiquement
          const affected = await ContactModel.acceptById(existing.id);
          if (affected === 0) throw new Error("Impossible d'accepter la demande");
          return { accepted: true, contactId: existing.id };
        }
        // si c'est déjà nous qui avons envoyé
        if (existing.user_id === userId && existing.contact_id === targetId) {
          throw new Error("Demande déjà envoyée");
        }
      }
      throw new Error("Relation existante non gérée");
    }

    // créer la demande
    const insertId = await ContactModel.insertRequest(userId, targetId);
    return { accepted: false, contactId: insertId };
  },

  // async acceptRequest(contactId, recipientId) {
  //   const affected = await ContactModel.acceptByIdForRecipient(contactId, recipientId);
  //   if (affected === 0) throw new Error("Demande introuvable ou vous n'êtes pas le destinataire");
  //   return true;
  // },
  // src/services/ContactService.js – modifier acceptRequest pour renvoyer la relation complète
  async acceptRequest(contactId, recipientId) {
    // Accepte la demande si le current user est bien contact_id
    const affected = await ContactModel.acceptByIdForRecipient(contactId, recipientId);
    if (affected === 0) {
      throw new Error("Demande introuvable ou vous n'êtes pas le destinataire");
    }
    // Récupère la ligne de contact mise à jour
    const contact = await ContactModel.findById(contactId);
    // Retourne un objet contenant les champs utiles (id, user_id, contact_id, status)
    return {
      id: contact.id,
      user_id: contact.user_id,         // ID de l'envoyeur original de la demande
      contact_id: contact.contact_id,   // ID du destinataire (current user)
      status: contact.status
    };
  },


  async declineRequest(contactId, recipientId) {
    const affected = await ContactModel.deletePendingForRecipient(contactId, recipientId);
    if (affected === 0) throw new Error("Demande introuvable ou vous n'êtes pas le destinataire");
    return true;
  },

  async cancelSentRequest(contactId, userId) {
    const affected = await ContactModel.deletePendingBySender(contactId, userId);
    if (affected === 0) throw new Error("Demande introuvable ou vous n'êtes pas l'expéditeur");
    return true;
  },

  async removeFriend(contactId, userId) {
    const affected = await ContactModel.deleteAccepted(contactId, userId);
    if (affected === 0) throw new Error("Relation introuvable ou vous n'êtes pas autorisé");
    return true;
  },

  // expose la recherche d'une relation entre 2 ids (utilisable côté frontend)
  async findBetween(userA, userB) {
    const row = await ContactModel.findBetween(userA, userB);
    if (!row) return null;
    // normalisation simple
    return {
      id: row.id,
      user_id: row.user_id,
      contact_id: row.contact_id,
      status: row.status
    };
  }
};

export default ContactService;
