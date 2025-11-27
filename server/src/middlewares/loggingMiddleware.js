export const loggingMiddleware = (req, res, next) => {
  console.log(`🌐 ${req.method} ${req.originalUrl}`);
  console.log('📝 Query params:', req.query);
  console.log('🔤 Headers:', req.headers);
  next();
};