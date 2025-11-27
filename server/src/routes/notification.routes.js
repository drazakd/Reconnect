// src/routes/notificationRoutes.js
import express from "express";
import NotificationController from "../controllers/NotificationController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Toutes les routes nécessitent un token valide
router.get("/", authMiddleware, NotificationController.getNotifications);
router.put("/:id/read", authMiddleware, NotificationController.markAsRead);
router.put("/read-all", authMiddleware, NotificationController.markAllAsRead);
router.delete("/:id", authMiddleware, NotificationController.deleteNotification);

export default router;
