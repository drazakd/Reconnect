// src/routes/contact.routes.js
import { Router } from "express";
import ContactController from "../controllers/ContactController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

// listes
router.get("/requests", ContactController.getIncomingRequests);
router.get("/sent", ContactController.getSentRequests);
router.get("/friends", ContactController.getFriends);

// état / relation entre current user et :id (utile côté frontend)
router.get("/:id/status", ContactController.getRelation);

// envoyer une demande au user :id
router.post("/:id/request", ContactController.sendRequest);

// accepter/refuser (ici :id = contact row id)
router.post("/:id/accept", ContactController.acceptRequest);
router.post("/:id/decline", ContactController.declineRequest);

// annuler demande envoyée (id = contact row id)
router.delete("/sent/:id", ContactController.cancelSentRequest);

// supprimer ami (id = contact row id)
router.delete("/:id", ContactController.removeFriend);

export default router;
