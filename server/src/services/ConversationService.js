// server/src/services/ConversationService.js
import ConversationModel from "../models/ConversationModel.js";
import MessageModel from "../models/MessageModel.js";

// Récupère les conversations et les détails (dernier message, nb non lus)
async function getConversations(userId) {
  const convs = await ConversationModel.getByUser(userId);
  // Pour chaque conversation, enrichir avec dernier message et nombre de non lus
  return Promise.all(convs.map(async (conv) => {
    const lastMsgRow = await MessageModel.getMessages(conv.id);
    const lastMessage = lastMsgRow.length ? lastMsgRow[lastMsgRow.length-1] : null;
    const unreadCount = await MessageModel.countUnread(conv.id, userId);
    return {
      id: conv.id,
      otherUser: {
        id: conv.otherId,
        nom: conv.nom,
        prenom: conv.prenom,
        image: conv.image,
      },
      lastMessage: lastMessage ? lastMessage.content : null,
      timestamp: lastMessage ? lastMessage.created_at : null,
      unread: unreadCount
    };
  }));
}


async function findOrCreateConversation(userId, otherUserId) {
  // 1️⃣ On cherche si la conversation existe déjà
  const [existing] = await ConversationModel.findByParticipants(userId, otherUserId);
  if (existing.length > 0) {
    return existing[0].id;
  }

  // 2️⃣ Sinon, on la crée
  const conversationId = await ConversationModel.create(userId, otherUserId);
  return conversationId;
}

export default { getConversations, findOrCreateConversation };
