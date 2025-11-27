// src/controllers/ContactController.js
import ContactService from "../services/ContactService.js";
import NotificationService from "../services/NotificationService.js";
import { success, error } from "../utils/response.js";
import db from "../config/db.js"; // Pour récupérer les infos de l'expéditeur

const ContactController = {
  async getIncomingRequests(req, res) {
    try {
      const requests = await ContactService.getIncomingRequests(req.user.id);
      return success(res, requests);
    } catch (err) {
      return error(res, err.message);
    }
  },

  async getSentRequests(req, res) {
    try {
      const requests = await ContactService.getSentRequests(req.user.id);
      return success(res, requests);
    } catch (err) {
      return error(res, err.message);
    }
  },

  async getFriends(req, res) {
    try {
      const friends = await ContactService.getFriends(req.user.id);
      return success(res, friends);
    } catch (err) {
      return error(res, err.message);
    }
  },

  // 🔹 Envoyer une demande d’ami
  async sendRequest(req, res) {
    try {
      const targetId = req.params.id;
      const fromUserId = req.user.id;

      console.log("📩 Tentative d’envoi demande:", { from: fromUserId, to: targetId });

      const result = await ContactService.sendRequest(fromUserId, targetId);

      // ✅ Récupérer nom et prénom de l’expéditeur
      const [users] = await db.query("SELECT nom, prenom FROM users WHERE id = ?", [fromUserId]);
      const fromUser = users[0];

      // ✅ Créer une notification (le body = id de l’expéditeur)
      await NotificationService.create({
        user_id: targetId,
        type: "contact_request",
        title: `${fromUser.nom} ${fromUser.prenom} vous a envoyé une demande d’amitié`,
        body: fromUserId.toString(),
        reference_id: result.contactId,
      });

      return success(res, {
        message: result.accepted ? "Demande acceptée automatiquement" : "Demande envoyée",
        contactId: result.contactId,
      });
    } catch (err) {
      console.error("❌ Erreur sendRequest:", err.stack || err);
      return error(res, err.message);
    }
  },

  // 🔹 Accepter une demande d’ami
  async acceptRequest(req, res) {
    try {
      const contactId = req.params.id;
      const relation = await ContactService.acceptRequest(contactId, req.user.id);

      // ✅ Notification pour l'expéditeur original
      await NotificationService.create({
        user_id: relation.user_id,
        type: "friend_accept",
        title: `${req.user.nom} a accepté votre demande d’amitié`,
        body: req.user.id.toString(), // ID de celui qui accepte
        reference_id: relation.id,
      });

      return success(res, { message: "Demande acceptée" });
    } catch (err) {
      console.error("❌ Erreur acceptRequest:", err.stack || err);
      return error(res, err.message);
    }
  },

  // 🔹 Refuser une demande d’ami
  async declineRequest(req, res) {
    try {
      const contactId = req.params.id;
      const relation = await ContactService.declineRequest(contactId, req.user.id);

      // ✅ Notification de refus
      await NotificationService.create({
        user_id: relation.user_id,
        type: "friend_decline",
        title: `${req.user.nom} a refusé votre demande d’amitié`,
        body: req.user.id.toString(),
        reference_id: relation.id,
      });

      return success(res, { message: "Demande refusée" });
    } catch (err) {
      return error(res, err.message);
    }
  },

  async cancelSentRequest(req, res) {
    try {
      const contactId = req.params.id;
      await ContactService.cancelSentRequest(contactId, req.user.id);
      return success(res, { message: "Demande annulée" });
    } catch (err) {
      return error(res, err.message);
    }
  },

  async removeFriend(req, res) {
    try {
      const contactId = req.params.id;
      await ContactService.removeFriend(contactId, req.user.id);
      return success(res, { message: "Ami supprimé" });
    } catch (err) {
      return error(res, err.message);
    }
  },

  async getRelation(req, res) {
    try {
      const otherId = req.params.id;
      const relation = await ContactService.findBetween(req.user.id, otherId);

      if (!relation) return success(res, { status: "none" });

      if (relation.status === "accepted") {
        return success(res, { status: "friend", contactId: relation.id });
      }

      if (relation.status === "pending") {
        if (parseInt(relation.user_id, 10) === parseInt(req.user.id, 10)) {
          return success(res, { status: "pending_sent", contactId: relation.id });
        } else {
          return success(res, { status: "pending_received", contactId: relation.id });
        }
      }

      return success(res, { status: relation.status, contactId: relation.id });
    } catch (err) {
      return error(res, err.message);
    }
  },
};

export default ContactController;




// // src/controllers/ContactController.js
// import ContactService from "../services/ContactService.js";
// import NotificationService from "../services/NotificationService.js";
// import { success, error } from "../utils/response.js";

// const ContactController = {
//   async getIncomingRequests(req, res) {
//     try {
//       const requests = await ContactService.getIncomingRequests(req.user.id);
//       return success(res, requests);
//     } catch (err) {
//       return error(res, err.message);
//     }
//   },

//   async getSentRequests(req, res) {
//     try {
//       const requests = await ContactService.getSentRequests(req.user.id);
//       return success(res, requests);
//     } catch (err) {
//       return error(res, err.message);
//     }
//   },

//   async getFriends(req, res) {
//     try {
//       const friends = await ContactService.getFriends(req.user.id);
//       return success(res, friends);
//     } catch (err) {
//       return error(res, err.message);
//     }
//   },

//   // 🔹 Envoyer une demande d’ami
//   async sendRequest(req, res) {
//     try {
//       const targetId = req.params.id;
//       console.log("📩 Tentative d’envoi demande:", { from: req.user.id, to: targetId });

//       const result = await ContactService.sendRequest(req.user.id, targetId);

//       // ✅ Créer une notification pour le destinataire
//       await NotificationService.create({
//         user_id: targetId,
//         type: "contact_request",
//         title: "Nouvelle demande d’amitié",
//         body: `${req.user.nom} vous a envoyé une demande d’amitié.`,
//         reference_id: result.contactId
//       });

//       if (result.accepted) {
//         return success(res, {
//           message: "Demande acceptée automatiquement",
//           contactId: result.contactId,
//         });
//       }

//       return success(res, {
//         message: "Demande envoyée",
//         contactId: result.contactId,
//       });
//     } catch (err) {
//       console.error("❌ Erreur sendRequest:", err.stack || err);
//       return res.status(500).json({
//         success: false,
//         message: err.message || "Erreur interne",
//       });
//     }
//   },

//   // 🔹 Accepter une demande d’ami
//   // async acceptRequest(req, res) {
//   //   try {
//   //     const contactId = req.params.id;
//   //     const relation = await ContactService.acceptRequest(contactId, req.user.id);

//   //     // ✅ Créer une notification pour celui qui a envoyé la demande
//   //     await NotificationService.create({
//   //       user_id: relation.sender_id,
//   //       type: "friend_accept",
//   //       title: "Demande d’amitié acceptée",
//   //       body: `${req.user.nom} a accepté votre demande d’amitié.`,
//   //       reference_id: relation.id
//   //     });

//   //     return success(res, { message: "Demande acceptée" });
//   //   } catch (err) {
//   //     console.error("❌ Erreur acceptRequest:", err.stack || err);
//   //     return error(res, err.message);
//   //   }
//   // },

//   // src/controllers/ContactController.js – utiliser user_id plutôt que sender_id
//   async acceptRequest(req, res) {
//     try {
//       const contactId = req.params.id;
//       const relation = await ContactService.acceptRequest(contactId, req.user.id);
//       // Créer une notification pour l'envoyeur original (relation.user_id)
//       await NotificationService.create({
//         user_id: relation.user_id,   // on prend user_id de la relation (l'envoyeur)
//         type: "friend_accept",
//         title: "Demande d’amitié acceptée",
//         body: `${req.user.nom} a accepté votre demande d’amitié.`,
//         reference_id: relation.id
//       });
//       return success(res, { message: "Demande acceptée" });
//     } catch (err) {
//       console.error("❌ Erreur acceptRequest:", err.stack || err);
//       return error(res, err.message);
//     }
//   },


//   async declineRequest(req, res) {
//     try {
//       const contactId = req.params.id;
//       await ContactService.declineRequest(contactId, req.user.id);
//       return success(res, { message: "Demande refusée" });
//     } catch (err) {
//       return error(res, err.message);
//     }
//   },

//   async cancelSentRequest(req, res) {
//     try {
//       const contactId = req.params.id;
//       await ContactService.cancelSentRequest(contactId, req.user.id);
//       return success(res, { message: "Demande annulée" });
//     } catch (err) {
//       return error(res, err.message);
//     }
//   },

//   async removeFriend(req, res) {
//     try {
//       const contactId = req.params.id;
//       await ContactService.removeFriend(contactId, req.user.id);
//       return success(res, { message: "Ami supprimé" });
//     } catch (err) {
//       return error(res, err.message);
//     }
//   },

//   async getRelation(req, res) {
//     try {
//       const otherId = req.params.id;
//       const relation = await ContactService.findBetween(req.user.id, otherId);

//       if (!relation) return success(res, { status: "none" });

//       if (relation.status === "accepted") {
//         return success(res, { status: "friend", contactId: relation.id });
//       }

//       if (relation.status === "pending") {
//         if (parseInt(relation.user_id, 10) === parseInt(req.user.id, 10)) {
//           return success(res, { status: "pending_sent", contactId: relation.id });
//         } else {
//           return success(res, { status: "pending_received", contactId: relation.id });
//         }
//       }

//       return success(res, { status: relation.status, contactId: relation.id });
//     } catch (err) {
//       return error(res, err.message);
//     }
//   },
// };

// export default ContactController;





// // src/controllers/ContactController.js
// import ContactService from "../services/ContactService.js";
// import NotificationService from "../services/NotificationService.js";
// import { success, error } from "../utils/response.js";

// const ContactController = {
//   async getIncomingRequests(req, res) {
//     try {
//       const requests = await ContactService.getIncomingRequests(req.user.id);
//       return success(res, requests);
//     } catch (err) {
//       return error(res, err.message);
//     }
//   },

//   async getSentRequests(req, res) {
//     try {
//       const requests = await ContactService.getSentRequests(req.user.id);
//       return success(res, requests);
//     } catch (err) {
//       return error(res, err.message);
//     }
//   },

//   async getFriends(req, res) {
//     try {
//       const friends = await ContactService.getFriends(req.user.id);
//       return success(res, friends);
//     } catch (err) {
//       return error(res, err.message);
//     }
//   },

//   // envoyer une demande au user dont l'id est req.params.id
//   async sendRequest(req, res) {
//     try {
//       const targetId = req.params.id;
//       console.log("📩 Tentative d’envoi demande:", { from: req.user.id, to: targetId });

//       const result = await ContactService.sendRequest(req.user.id, targetId);

//       if (result.accepted) {
//         return success(res, { message: "Demande acceptée automatiquement", contactId: result.contactId });
//       }

//       return success(res, { message: "Demande envoyée", contactId: result.contactId });
//     } catch (err) {
//       console.error("❌ Erreur sendRequest:", err.stack || err); // 🔥 Affiche toute la stack
//       return res.status(500).json({ success: false, message: err.message || "Erreur interne" });
//     }
//   },


//   // accepter — id = contact row id
//   async acceptRequest(req, res) {
//     try {
//       const contactId = req.params.id;
//       const relation = await ContactService.acceptRequest(contactId, req.user.id);

//       // ✅ notification pour l’expéditeur
//       await NotificationService.create(
//         relation.sender_id,
//         "friend_accept",
//         `${req.user.nom} a accepté votre demande d’amitié.`
//       );

//       return success(res, { message: "Demande acceptée" });
//     } catch (err) {
//       return error(res, err.message);
//     }
//   },

//   // refuser — id = contact row id
//   async declineRequest(req, res) {
//     try {
//       const contactId = req.params.id;
//       await ContactService.declineRequest(contactId, req.user.id);
//       return success(res, { message: "Demande refusée" });
//     } catch (err) {
//       return error(res, err.message);
//     }
//   },

//   // annuler demande envoyée — id = contact row id
//   async cancelSentRequest(req, res) {
//     try {
//       const contactId = req.params.id;
//       await ContactService.cancelSentRequest(contactId, req.user.id);
//       return success(res, { message: "Demande annulée" });
//     } catch (err) {
//       return error(res, err.message);
//     }
//   },

//   // supprimer ami — id = contact row id
//   async removeFriend(req, res) {
//     try {
//       const contactId = req.params.id;
//       await ContactService.removeFriend(contactId, req.user.id);
//       return success(res, { message: "Ami supprimé" });
//     } catch (err) {
//       return error(res, err.message);
//     }
//   },

//   // récupérer l'état entre current user et un autre user
//   async getRelation(req, res) {
//     try {
//       const otherId = req.params.id;
//       const relation = await ContactService.findBetween(req.user.id, otherId);
//       if (!relation) return success(res, { status: "none" });

//       if (relation.status === "accepted") {
//         return success(res, { status: "friend", contactId: relation.id });
//       }
//       if (relation.status === "pending") {
//         if (parseInt(relation.user_id, 10) === parseInt(req.user.id, 10)) {
//           return success(res, { status: "pending_sent", contactId: relation.id });
//         } else {
//           return success(res, { status: "pending_received", contactId: relation.id });
//         }
//       }
//       return success(res, { status: relation.status, contactId: relation.id });
//     } catch (err) {
//       return error(res, err.message);
//     }
//   }
// };

// export default ContactController;
