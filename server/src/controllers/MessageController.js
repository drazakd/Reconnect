// server/src/controllers/MessageController.js
import MessageService from "../services/MessageService.js";
import { success, error } from "../utils/response.js";

const MessageController = {
  // GET /api/conversations/:id/messages
  async getMessages(req, res) {
    try {
      const conversationId = req.params.id;
      const userId = req.user.id;
      const msgs = await MessageService.getMessages(conversationId, userId);
      return success(res, msgs);
    } catch (err) {
      return error(res, err.message);
    }
  },
  // POST /api/conversations/:id/messages
  async sendMessage(req, res) {
    try {
      const conversationId = req.params.id;
      const senderId = req.user.id;
      const { content } = req.body;
      const message = await MessageService.sendMessage(conversationId, senderId, content);
      return success(res, message);
    } catch (err) {
      return error(res, err.message);
    }
  },
  // PATCH /api/conversations/:id/messages/read
  async markRead(req, res) {
    try {
      const conversationId = req.params.id;
      const userId = req.user.id;
      await MessageService.markRead(conversationId, userId);
      return success(res, { message: "Messages marqués comme lus" });
    } catch (err) {
      return error(res, err.message);
    }
  }
};

export default MessageController;
