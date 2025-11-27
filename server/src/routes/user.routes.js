// server/src/routes/user.routes.js
import express from "express";
import UserController from "../controllers/UserController.js";
import upload from "../middlewares/uploadMiddleware.js";
import pool from "../config/db.js";

const router = express.Router();

// ✅ Créer un utilisateur
router.post("/", upload.single("image"), UserController.createUser);

// ✅ Rechercher des utilisateurs
router.get("/search", UserController.searchUsers);

// ✅ Récupérer tous les utilisateurs
router.get("/", UserController.getAllUsers);

// ✅ Récupérer la liste des pays distincts
router.get("/pays", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT DISTINCT pays FROM users WHERE pays IS NOT NULL AND pays <> ''"
    );
    res.json(rows);
  } catch (error) {
    console.error("Erreur récupération pays:", error);
    res.status(500).json({ message: "Erreur récupération pays" });
  }
});

// ✅ Récupérer la liste des villes pour un pays
router.get("/villes/:pays", async (req, res) => {
  try {
    const { pays } = req.params;
    const [rows] = await pool.query(
      "SELECT DISTINCT ville FROM users WHERE pays = ? AND ville IS NOT NULL AND ville <> ''",
      [pays]
    );
    res.json(rows.map((r) => r.ville));
  } catch (error) {
    console.error("Erreur récupération villes:", error);
    res.status(500).json({ message: "Erreur récupération villes" });
  }
});

// ✅ Récupérer un utilisateur par ID
router.get("/:id", UserController.getUser);

// ✅ Mettre à jour un utilisateur
router.put("/:id", upload.single("image"), UserController.updateUser);

// ✅ Supprimer un utilisateur
router.delete("/:id", UserController.deleteUser);

export default router;










// import express from "express";
// import UserController from "../controllers/UserController.js";
// import upload from "../middlewares/uploadMiddleware.js";
// import pool from "../config/db.js"; // <-- n'oublie pas ta connexion MySQL

// const router = express.Router();

// // CRUD des users
// // Create a new user avec upload d'image
// router.post("/users", upload.single("image"), UserController.createUser);

// // Recherche avancée multi-filtres
// router.get("/users/search", UserController.searchUsers);

// // Get all users with pagination + filtres
// router.get("/users", UserController.getAllUsers);

// // Get users by location
// router.get("/users/location", UserController.getUsersByLocation);

// // Get user by ID
// router.get("/users/:id", UserController.getUser);

// // Update user
// router.put("/users/:id", upload.single("image"), UserController.updateUser);

// // Delete user
// router.delete("/users/:id", UserController.deleteUser);

// //
// // 🔹 Récupérer la liste des pays distincts
// //
// router.get("/users/pays", async (req, res) => {
//   try {
//     const [rows] = await pool.query(
//       "SELECT DISTINCT pays FROM users WHERE pays IS NOT NULL AND pays <> ''"
//     );
//     res.json(rows);
//     // res.json(rows.map((r) => r.pays));
//   } catch (error) {
//     console.error("Erreur récupération pays:", error);
//     res.status(500).json({ message: "Erreur récupération pays" });
//   }
// });

// //
// // 🔹 Récupérer la liste des villes par pays
// //
// router.get("/users/villes/:pays", async (req, res) => {
//   try {
//     const { pays } = req.params;
//     const [rows] = await pool.query(
//       "SELECT DISTINCT ville FROM users WHERE pays = ? AND ville IS NOT NULL AND ville <> ''",
//       [pays]
//     );
//     res.json(rows.map((r) => r.ville));
//   } catch (error) {
//     console.error("Erreur récupération villes:", error);
//     res.status(500).json({ message: "Erreur récupération villes" });
//   }
// });

// // Recherche avancée
// router.get("/search", UserController.searchUsers);

// // Filtrage par localisation
// router.get("/location", UserController.getUsersByLocation);


// export default router;
