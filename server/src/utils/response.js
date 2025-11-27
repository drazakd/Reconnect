// utils/response.js

// Réponses réussies
export const success = (res, data = null, message = "Succès", code = 200) => {
  return res.status(code).json({
    success: true,
    code,
    message,
    data,
  });
};

// Réponses d'erreurs
export const error = (res, message = "Erreur serveur", code = 500, details = null) => {
  return res.status(code).json({
    success: false,
    code,
    message,
    ...(details && { details }), // Ajoute des infos complémentaires si dispo
  });
};
