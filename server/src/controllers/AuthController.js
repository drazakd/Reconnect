// AuthController.js
import AuthService from "../services/AuthService.js";
import { success, error } from "../utils/response.js";

export const register = async (req, res) => {
  try {

    // Récupérer l'image si présente
    const imagePath = req.file ? req.file.path : null;

    // Ajouter le chemin de l'image aux données envoyées au service
    const dataToRegister = { ...req.body, image: imagePath };

    const data = await AuthService.register(dataToRegister);
    return success(res, data, "Inscription réussie", 201); // 201 = Created
  } catch (err) {
    return error(res, err.message, err.code || 400);
  }
};

export const login = async (req, res) => {
  try {
    const data = await AuthService.login(req.body);
    return success(res, data, "Connexion réussie", 200);
  } catch (err) {
    return error(res, err.message, err.code || 401); // 401 = Unauthorized
  }
};

export const logout = async (req, res) => {
  try {
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;

    if (!token) return error(res, "Token manquant", 401);

    const data = await AuthService.logout(token);
    return success(res, data, "Déconnexion réussie", 200);
  } catch (err) {
    return error(res, err.message, err.code || 500);
  }
};

// 🔹 Récupération du profil utilisateur (GET /api/auth/me)
export const getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return error(res, "Token manquant", 401);
    }

    const token = authHeader.split(" ")[1];
    const user = await AuthService.getMe(token);

    return success(res, user, "Profil utilisateur récupéré avec succès");
  } catch (err) {
    console.error("Erreur dans getMe (controller):", err);
    return error(res, err.message || "Erreur serveur", 500);
  }
};