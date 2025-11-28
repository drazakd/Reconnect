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
export const error = (res, status, message) => {
  const code = Number(status);

  return res
    .status(code && !isNaN(code) ? code : 500)
    .json({ error: message || "Erreur interne du serveur" });
};

