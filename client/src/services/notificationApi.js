// src/services/NotificationApi.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// 🔹 Notifications

// Récupérer toutes les notifications
export const getNotifications = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("📩 Données reçues du backend:", res.data);
    return res.data.data;
  } catch (err) {
    console.error("Erreur getNotifications:", err);
    return [];
  }
};


// Marquer une notification comme lue
export const markNotificationAsRead = async (id, token) => {
  try {
    await axios.put(
      `${API_URL}/notifications/${id}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (err) {
    console.error("Erreur markNotificationAsRead:", err);
  }
};

// Tout marquer comme lu
export const markAllNotificationsAsRead = async (token) => {
  try {
    await axios.put(
      `${API_URL}/notifications/read-all`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (err) {
    console.error("Erreur markAllNotificationsAsRead:", err);
  }
};

// Supprimer une notification
export const deleteNotification = async (id, token) => {
  try {
    await axios.delete(`${API_URL}/notifications/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("Erreur deleteNotification:", err);
  }
};

// 🔹 Demandes d'ami (pour mini-card ou notifications interactives)

// Accepter une demande d'ami
export const acceptRequest = async (contactId, token) => {
  try {
    const res = await axios.post(
      `${API_URL}/contacts/${contactId}/accept`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (err) {
    console.error("Erreur acceptRequest:", err);
    throw err;
  }
};

// Refuser une demande d'ami
export const declineRequest = async (contactId, token) => {
  try {
    const res = await axios.post(
      `${API_URL}/contacts/${contactId}/decline`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (err) {
    console.error("Erreur declineRequest:", err);
    throw err;
  }
};

// Annuler une demande envoyée
export const cancelSentRequest = async (contactId, token) => {
  try {
    const res = await axios.post(
      `${API_URL}/contacts/${contactId}/cancel`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (err) {
    console.error("Erreur cancelSentRequest:", err);
    throw err;
  }
};

// Supprimer un ami
export const removeFriend = async (contactId, token) => {
  try {
    const res = await axios.delete(`${API_URL}/contacts/${contactId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Erreur removeFriend:", err);
    throw err;
  }
};
