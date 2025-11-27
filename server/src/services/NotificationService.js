// src/services/NotificationService.js
// src/services/NotificationService.js
import NotificationModel from "../models/NotificationModel.js";

const NotificationService = {
  async create({ user_id, type, title, body = null, reference_id = null }) {
    return await NotificationModel.create({
      user_id,
      type,
      title,
      body,
      reference_id,
    });
  },

  // 🔹 Renommée pour être compatible avec NotificationController
  async getByUser(user_id) {
    return await NotificationModel.getByUser(user_id);
  },

  async markAsRead(id, user_id) {
    return await NotificationModel.markAsRead(id, user_id);
  },

  async markAllAsRead(user_id) {
    return await NotificationModel.markAllAsRead(user_id);
  },

  async delete(id, user_id) {
    return await NotificationModel.delete(id, user_id);
  },
};

export default NotificationService;







// // src/services/NotificationService.js
// import NotificationModel from "../models/NotificationModel.js";

// const NotificationService = {
//   async create(user_id, type, message) {
//     return await NotificationModel.create({ user_id, type, message });
//   },

//   async getByUser(userId) {
//     return await NotificationModel.getByUser(userId);
//   },

//   async markAsRead(id, userId) {
//     return await NotificationModel.markAsRead(id, userId);
//   },

//   async markAllAsRead(userId) {
//     return await NotificationModel.markAllAsRead(userId);
//   },

//   async delete(id, userId) {
//     return await NotificationModel.delete(id, userId);
//   },
// };

// export default NotificationService;
