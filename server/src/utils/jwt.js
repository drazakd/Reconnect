// src/utils/jwt.js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

// ⚠️ Simple Set en mémoire (à remplacer par Redis ou DB en prod)
const blacklistedTokens = new Set();

/**
 * Génère un token JWT
 */
export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/**
 * Vérifie si le token est valide (et non blacklisté)
 */
export const verifyToken = (token) => {
  if (blacklistedTokens.has(token)) {
    throw new Error("Token invalidé");
  }
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Ajoute un token dans la blacklist
 */
export const blacklistToken = (token) => {
  blacklistedTokens.add(token);
};

/**
 * Vérifie si un token est blacklisté
 */
export const isTokenBlacklisted = (token) => {
  return blacklistedTokens.has(token);
};
