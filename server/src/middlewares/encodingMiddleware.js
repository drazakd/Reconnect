/**
 * Middleware ultra-simple pour Docker
 */
export const encodingMiddleware = (req, res, next) => {
  // 🔥 CORRECTION: Ne rien faire - laisser Express gérer l'encodage
  next();
};