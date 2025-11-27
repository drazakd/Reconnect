// Server/src/middlewares/authMiddleware.js
import { verifyToken } from "../utils/jwt.js";

export default function authMiddleware(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Accès refusé : token manquant" });
  }

  try {
    req.user = verifyToken(token); // 🔥 utilise notre utilitaire qui check aussi la blacklist
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
}




// import jwt from "jsonwebtoken";

// export default function authMiddleware(req, res, next) {
//   const hdr = req.headers.authorization || "";
//   const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
//   if (!token) return res.status(401).json({ message: "Accès refusé : token manquant" });

//   try {
//     req.user = jwt.verify(token, process.env.JWT_SECRET);
//     next();
//   } catch {
//     return res.status(401).json({ message: "Token invalide ou expiré" });
//   }
// }
