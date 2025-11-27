// server/src/controllers/UserController.js
import UserService from "../services/UserService.js";
import pool from "../config/db.js"; // ⚠️ IMPORTANT

// Fonction utilitaire pour formatter un user avec une URL complète de l'image
function formatUser(user, req) {
  if (!user) return null;

  let imagePath = user.image;
  if (imagePath && !imagePath.startsWith("/")) {
    imagePath = `/${imagePath}`;
  }

  return {
    ...(user._doc || user),
    image: imagePath ? `${req.protocol}://${req.get("host")}${imagePath}` : null
  };
}


class UserController {
  static async createUser(req, res) {
    try {
      const image = req.file ? `/uploads/${req.file.filename}` : null;

      const user = await UserService.createUser({
        ...req.body,
        image
      });

      res.status(201).json({
        success: true,
        data: formatUser(user, req),
        message: "User created successfully"
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getUser(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      res.status(200).json({
        success: true,
        data: formatUser(user, req)
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async updateUser(req, res) {
    try {
      const image = req.file ? `/uploads/${req.file.filename}` : undefined;

      const user = await UserService.updateUser(req.params.id, {
        ...req.body,
        ...(image && { image })
      });

      res.status(200).json({
        success: true,
        data: formatUser(user, req),
        message: "User updated successfully"
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async deleteUser(req, res) {
    try {
      const result = await UserService.deleteUser(req.params.id);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await UserService.getAllUsers(page, limit);

      res.status(200).json({
        success: true,
        data: result.users.map(u => formatUser(u, req)),
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getUsersByLocation(req, res) {
    try {
      const { pays, ville } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      if (!pays || !ville) {
        return res.status(400).json({
          success: false,
          message: "Country and city parameters are required"
        });
      }

      const users = await UserService.getUsersByLocation(pays, ville, page, limit);

      res.status(200).json({
        success: true,
        data: users.map(u => formatUser(u, req))
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async searchUsers(req, res) {
    try {
      console.log('🎯 DEBUT searchUsers - Headers:', req.headers);
      console.log('🎯 Paramètres query:', req.query);
      
      const { nom, prenom, entreprise, ecole, pays, ville } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      // Test direct avec la base de données
      console.log('🎯 Test connexion DB directe...');
      const [testRows] = await pool.execute('SELECT 1 as test');
      console.log('✅ Test DB réussi:', testRows);

      // ✅ CORRECTION : Ajouter le champ image dans le SELECT
      let query = `
        SELECT 
          id, 
          nom, 
          prenom, 
          pays, 
          ville, 
          ecole, 
          entreprise,
          bio,
          image  -- ⭐ AJOUTEZ CE CHAMP
        FROM users 
        WHERE is_visible = 1
      `;
      const values = [];
      
      if (nom) {
        query += ' AND nom LIKE ?';
        values.push(`%${nom}%`);
      }
      
      if (prenom) {
        query += ' AND prenom LIKE ?';
        values.push(`%${prenom}%`);
      }

      if (entreprise) {
        query += ' AND entreprise LIKE ?';
        values.push(`%${entreprise}%`);
      }

      if (ecole) {
        query += ' AND ecole LIKE ?';
        values.push(`%${ecole}%`);
      }
      
      if (pays) {
        query += ' AND pays LIKE ?';
        values.push(`%${pays}%`);
      }
      
      if (ville) {
        query += ' AND ville LIKE ?';
        values.push(`%${ville}%`);
      }
      
      query += ' LIMIT 10';
      
      console.log('🎯 Requête manuelle:', query);
      console.log('🎯 Valeurs manuelles:', values);
      
      const [users] = await pool.execute(query, values);
      console.log('✅ Résultats bruts:', users);

      // ✅ FORMATER les utilisateurs avec l'URL complète de l'image
      const formattedUsers = users.map(user => {
        if (!user) return null;

        let imagePath = user.image;
        if (imagePath && !imagePath.startsWith("/")) {
          imagePath = `/${imagePath}`;
        }

        return {
          ...user,
          image: imagePath ? `${req.protocol}://${req.get("host")}${imagePath}` : null
        };
      });

      res.status(200).json({
        success: true,
        data: formattedUsers,  // ✅ Utiliser les utilisateurs formatés
        message: "Recherche réussie"
      });

    } catch (error) {
      console.error('💥 ERREUR CRITIQUE searchUsers:');
      console.error('💥 Message:', error.message);
      console.error('💥 Stack:', error.stack);
      
      res.status(500).json({
        success: false,
        message: `Erreur serveur: ${error.message}`,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // static async searchUsers(req, res) {
  //   try {
  //     const { nom, prenom, entreprise, ecole, pays, ville } = req.query;
  //     const page = parseInt(req.query.page) || 1;
  //     const limit = parseInt(req.query.limit) || 10;

  //     // ⚡ On enlève les filtres vides
  //     const filters = {};
  //     if (nom) filters.nom = nom;
  //     if (prenom) filters.prenom = prenom;
  //     if (entreprise) filters.entreprise = entreprise;
  //     if (ecole) filters.ecole = ecole;
  //     if (pays) filters.pays = pays;
  //     if (ville) filters.ville = ville;

  //     if (Object.keys(filters).length === 0) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "At least one search parameter is required"
  //       });
  //     }

  //     const result = await UserService.searchUsers(filters, page, limit);

  //     res.status(200).json({
  //       success: true,
  //       data: result.users.map(u => formatUser(u, req)),
  //       pagination: result.pagination
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       success: false,
  //       message: error.message
  //     });
  //   }
  // }
}

export default UserController;






// import UserService from "../services/UserService.js";

// class UserController {
//   static async createUser(req, res) {
//     try {
//       // 📌 Récupérer l'image si fournie
//       const image = req.file ? `/uploads/${req.file.filename}` : null;

//       const user = await UserService.createUser({
//         ...req.body,
//         image
//       });

//       res.status(201).json({
//         success: true,
//         data: user,
//         message: "User created successfully"
//       });
//     } catch (error) {
//       res.status(400).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   static async getUser(req, res) {
//     try {
//       const user = await UserService.getUserById(req.params.id);
//       if (!user) {
//         return res.status(404).json({
//           success: false,
//           message: "User not found"
//         });
//       }
//       res.status(200).json({
//         success: true,
//         data: user
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   static async updateUser(req, res) {
//     try {
//       // 📌 Si nouvelle image uploadée
//       const image = req.file ? `/uploads/${req.file.filename}` : undefined;

//       const user = await UserService.updateUser(req.params.id, {
//         ...req.body,
//         ...(image && { image }) // ajoute `image` seulement si défini
//       });

//       res.status(200).json({
//         success: true,
//         data: user,
//         message: "User updated successfully"
//       });
//     } catch (error) {
//       res.status(400).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   static async deleteUser(req, res) {
//     try {
//       const result = await UserService.deleteUser(req.params.id);
//       res.status(200).json({
//         success: true,
//         message: result.message
//       });
//     } catch (error) {
//       res.status(404).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   static async getAllUsers(req, res) {
//     try {
//       const page = parseInt(req.query.page) || 1;
//       const limit = parseInt(req.query.limit) || 10;

//       const result = await UserService.getAllUsers(page, limit);
//       res.status(200).json({
//         success: true,
//         data: result.users,
//         pagination: result.pagination
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   static async getUsersByLocation(req, res) {
//     try {
//       const { pays, ville } = req.query;
//       const page = parseInt(req.query.page) || 1;
//       const limit = parseInt(req.query.limit) || 10;

//       if (!pays || !ville) {
//         return res.status(400).json({
//           success: false,
//           message: "Country and city parameters are required"
//         });
//       }

//       const users = await UserService.getUsersByLocation(pays, ville, page, limit);
//       res.status(200).json({
//         success: true,
//         data: users
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   static async searchUsers(req, res) {
//     try {
//       const { nom, prenom, entreprise, ecole, pays, ville } = req.query;
//       const page = parseInt(req.query.page) || 1;
//       const limit = parseInt(req.query.limit) || 10;

//       // 📌 Si aucun paramètre n'est fourni
//       if (!nom && !prenom && !entreprise && !ecole && !pays && !ville) {
//         return res.status(400).json({
//           success: false,
//           message: "At least one search parameter is required"
//         });
//       }

//       const result = await UserService.searchUsers(
//         { nom, prenom, entreprise, ecole, pays, ville },
//         page,
//         limit
//       );

//       res.status(200).json({
//         success: true,
//         data: result.users,
//         pagination: result.pagination
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

// }

// export default UserController;
