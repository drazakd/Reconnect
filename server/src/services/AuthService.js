// Server/src/services/AuthService.js
import pool from "../config/db.js";
import bcrypt from "bcrypt";
import { generateToken, blacklistToken } from "../utils/jwt.js";

class AuthService {
  // 🔹 Inscription
  // service/AuthService.js
  static async register({ nom, prenom, email, password, pays, ville, telephone, sexe, ecole, entreprise, bio, image }) {
    // Vérifie si l'email existe déjà
    const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      // message d'erreur plus explicite
      throw new Error("Cet Email est déjà utilisé");
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (nom, prenom, email, password_hash, pays, ville, telephone, sexe, ecole, entreprise, bio, image) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nom, prenom, email, hash, pays, ville, telephone, sexe, ecole, entreprise, bio, image]
    );

    const user = { id: result.insertId, nom, prenom, email, pays, ville, telephone, sexe, ecole, entreprise, bio, image };
    const token = generateToken(user);

    return { user, token };
  }


  // 🔹 Connexion
  static async login({ email, password }) {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows.length) throw new Error("Utilisateur introuvable");

    const user = rows[0];

    // Vérifie le mot de passe
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error("Mot de passe incorrect");

    const token = generateToken(user);

    // Supprimer le hash du retour
    delete user.password_hash;

    return { user, token };
  }

  // 🔹 Déconnexion
  static async logout(token) {
    // Ajoute le token à la blacklist
    blacklistToken(token);
    return { message: "Déconnexion réussie" };
  }

  // 🔹 Récupération du profil utilisateur via token
  static async getMe(token) {
    try {
      const decoded = verifyToken(token);
      if (!decoded) throw new Error("Token invalide");

      const [rows] = await pool.query(
        `SELECT id, nom, prenom, email, telephone, bio, image, ecole, entreprise, pays, ville, sexe 
         FROM users WHERE id = ?`,
        [decoded.id]
      );

      if (rows.length === 0) throw new Error("Utilisateur introuvable");

      return rows[0];
    } catch (error) {
      console.error("Erreur dans AuthService.getMe:", error);
      throw error;
    }
  }
}

export default AuthService;
