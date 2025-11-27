// Server/src/middlewares/errorMiddleware.js
export const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.error("🔥 Error:", err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || "Erreur serveur interne";

  if (err.code === "ER_DUP_ENTRY" || err.code === 1062) {
    statusCode = 409;
    message = "Doublon (valeur déjà utilisée)";
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Token invalide";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expiré";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route non trouvée - ${req.originalUrl}`));
};

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
