// models/FriendRequest.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js"; // ton instance Sequelize
import User from "./User.js";

const FriendRequest = sequelize.define("FriendRequest", {
  status: {
    type: DataTypes.ENUM("pending", "accepted", "rejected"),
    defaultValue: "pending",
  },
});

// Relations
FriendRequest.belongsTo(User, { as: "from", foreignKey: "fromUserId" });
FriendRequest.belongsTo(User, { as: "to", foreignKey: "toUserId" });

export default FriendRequest;
