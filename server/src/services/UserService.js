// server/src/services/UserService.js
import UserModel from "../models/UserModel.js";
import bcrypt from "bcrypt";

class UserService {
  static async createUser(userData) {
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    
    const userToCreate = {
      ...userData,
      password_hash: hashedPassword
    };

    const userId = await UserModel.create(userToCreate);
    return UserModel.findById(userId);
  }

  static async getUserById(id) {
    return await UserModel.findById(id);
  }

  static async getUserByEmail(email) {
    return await UserModel.findByEmail(email);
  }

  static async updateUser(id, updateData) {
    if (updateData.password) {
      const saltRounds = 10;
      updateData.password_hash = await bcrypt.hash(updateData.password, saltRounds);
      delete updateData.password;
    }

    const affectedRows = await UserModel.update(id, updateData);
    if (affectedRows === 0) {
      throw new Error("User not found or no changes made");
    }

    return await UserModel.findById(id);
  }

  static async deleteUser(id) {
    const affectedRows = await UserModel.delete(id);
    if (affectedRows === 0) {
      throw new Error("User not found");
    }
    return { message: "User deleted successfully" };
  }

  static async getAllUsers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const users = await UserModel.findAll(limit, offset);
    const total = await UserModel.count();
    
    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getUsersByLocation(pays, ville, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const users = await UserModel.findByLocation(pays, ville, limit, offset);
    return users;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // nouvelle méthode pour la recherche avec filtres corrigée
  static async searchUsers(filters, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    // On enlève les clés undefined ou vides
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v && v.trim() !== "")
    );

    const users = await UserModel.search(cleanFilters, limit, offset);
    const total = await UserModel.countByFilters(cleanFilters);

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

export default UserService;