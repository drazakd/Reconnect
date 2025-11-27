// routes/friends.js
import express from "express";
import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

const router = express.Router();

// Envoyer une demande d’ami
router.post("/send", async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body;

    if (fromUserId === toUserId) {
      return res.status(400).json({ message: "Impossible de s'ajouter soi-même." });
    }

    // Vérifier si déjà amis ou demande existante
    const exists = await FriendRequest.findOne({
      from: fromUserId,
      to: toUserId,
      status: "pending",
    });

    if (exists) {
      return res.status(400).json({ message: "Demande déjà envoyée." });
    }

    const newRequest = new FriendRequest({
      from: fromUserId,
      to: toUserId,
      status: "pending",
    });

    await newRequest.save();

    res.json({ message: "Demande envoyée ✅", request: newRequest });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// Accepter une demande
router.post("/accept", async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await FriendRequest.findById(requestId);

    if (!request) return res.status(404).json({ message: "Demande introuvable" });

    request.status = "accepted";
    await request.save();

    res.json({ message: "Demande acceptée ✅", request });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// Refuser une demande
router.post("/reject", async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await FriendRequest.findById(requestId);

    if (!request) return res.status(404).json({ message: "Demande introuvable" });

    request.status = "rejected";
    await request.save();

    res.json({ message: "Demande refusée ❌", request });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// Voir mes demandes reçues
router.get("/requests/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const requests = await FriendRequest.find({ to: userId, status: "pending" })
      .populate("from", "nom prenom email image");

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// Voir mes amis
router.get("/friends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const friends = await FriendRequest.find({
      $or: [{ from: userId }, { to: userId }],
      status: "accepted",
    }).populate("from to", "nom prenom email image");

    res.json(friends);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

export default router;
