// server/src/controllers/ConversationController.js
import ConversationService from "../services/ConversationService.js";
import { success, error } from "../utils/response.js";

const ConversationController = {
  // GET /api/conversations
  async getConversations(req, res) {
    try {
      const userId = req.user.id;
      const convs = await ConversationService.getConversations(userId);
      return success(res, convs);
    } catch (err) {
      return error(res, err.message);
    }
  },

  // NOUVEAU : POST /api/conversations
  // Crée ou récupère une conversation entre l'utilisateur connecté et otherUserId
  async createConversation(req, res) {
    try {
      const userId = req.user.id;
      const { otherUserId } = req.body;

      if (!otherUserId) {
        return error(res, "Paramètre otherUserId manquant");
      }

      // utilise le service pour trouver ou créer la conversation
      const conversationId = await ConversationService.findOrCreateConversation(
        userId,
        otherUserId
      );

      return success(res, { id: conversationId });
    } catch (err) {
      console.error("Erreur création conversation :", err);
      return error(res, err.message || "Erreur interne");
    }
  },
};



export default ConversationController;
