// Server/src/routes/auth.routes.js
import express from "express";
import { register, login, logout, getMe } from "../controllers/AuthController.js";
import { asyncHandler } from "../middlewares/errorMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import validate, { registerSchema } from "../middlewares/validationMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js"; // <-- importer multer

const router = express.Router();

// ⚡ Route d'inscription avec image
// 'image' correspond au name de ton input <Input type="file" name="image" />
router.post(
  "/register",
  upload.single("image"),         // <-- multer pour gérer l'image
  validate(registerSchema),       // <-- validation de données
  asyncHandler(register)          // <-- ton controller
);

router.post("/login", login);
router.post("/logout", authMiddleware, logout);

router.get("/me", authMiddleware, getMe); // 🔹 Route pour récupérer le profil utilisateur

export default router;
