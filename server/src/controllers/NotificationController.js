// src/controllers/NotificationController.js
import NotificationService from "../services/NotificationService.js";

const NotificationController = {
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const notifications = await NotificationService.getByUser(userId);
      res.json({ success: true, data: notifications });
    } catch (err) {
      console.error("Erreur getNotifications:", err);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      await NotificationService.markAsRead(id, userId);
      res.json({ success: true, message: "Notification marquée comme lue" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      await NotificationService.markAllAsRead(userId);
      res.json({ success: true, message: "Toutes les notifications ont été lues" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  async deleteNotification(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      await NotificationService.delete(id, userId);
      res.json({ success: true, message: "Notification supprimée" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },
};

export default NotificationController;
