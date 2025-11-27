// server/src/models/UserModel.js
import pool from "../config/db.js";

class UserModel {
  // 🔹 Création d'un utilisateur
  static async create(userData) {
    const {
      nom,
      prenom,
      email,
      telephone,
      sexe,
      pays,
      ville,
      ecole,
      entreprise,
      bio,
      image,
      password_hash,
      is_email_verified = false,
      is_visible = true
    } = userData;

    const [result] = await pool.execute(
      `INSERT INTO users 
       (nom, prenom, email, telephone, sexe, pays, ville, ecole, entreprise, bio, image, password_hash, is_email_verified, is_visible) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nom,
        prenom,
        email,
        telephone,
        sexe,
        pays,
        ville,
        ecole,
        entreprise,
        bio,
        image,
        password_hash,
        is_email_verified,
        is_visible
      ]
    );

    return result.insertId;
  }

  // 🔹 Trouver un utilisateur par email
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return rows[0];
  }

  // 🔹 Trouver un utilisateur par ID
  static async findById(id) {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  // 🔹 Mise à jour d'un utilisateur
  static async update(id, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(", ");
    const values = Object.values(updateData);
    values.push(id);

    const [result] = await pool.execute(
      `UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return result.affectedRows;
  }

  // 🔹 Suppression d'un utilisateur
  static async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM users WHERE id = ?",
      [id]
    );
    return result.affectedRows;
  }

  // 🔹 Récupérer tous les utilisateurs visibles
  static async findAll(limit = 10, offset = 0) {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE is_visible = TRUE LIMIT ? OFFSET ?",
      [limit, offset]
    );
    return rows;
  }

  // 🔹 Recherche avancée multi-filtres (nom, prenom, pays, ville, école, entreprise)
  static async search(filters, limit = 10, offset = 0) {
    let query = "SELECT * FROM users WHERE is_visible = TRUE";
    const values = [];

    Object.entries(filters).forEach(([key, value]) => {
      query += ` AND ${key} LIKE ?`;
      values.push(`%${value}%`);
    });

    query += " LIMIT ? OFFSET ?";
    values.push(limit, offset);

    const [rows] = await pool.execute(query, values);
    return rows;
  }

  // 🔹 Compter les utilisateurs visibles avec filtres
  static async countByFilters(filters) {
    let query = "SELECT COUNT(*) as total FROM users WHERE is_visible = TRUE";
    const values = [];

    Object.entries(filters).forEach(([key, value]) => {
      query += ` AND ${key} LIKE ?`;
      values.push(`%${value}%`);
    });

    const [rows] = await pool.execute(query, values);
    return rows[0].total;
  }

  // 🔹 Compter tous les utilisateurs visibles
  static async count() {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) as total FROM users WHERE is_visible = TRUE"
    );
    return rows[0].total;
  }
}

export default UserModel;














// import pool from "../config/db.js";

// class UserModel {
//   // 🔹 Création d'un utilisateur
//   static async create(userData) {
//     const {
//       nom,
//       prenom,
//       email,
//       telephone,
//       sexe,
//       pays,
//       ville,
//       ecole,
//       entreprise,
//       image,
//       password_hash,
//       is_email_verified = false,
//       is_visible = true
//     } = userData;

//     const [result] = await pool.execute(
//       `INSERT INTO users 
//        (nom, prenom, email, telephone, sexe, ecole, entreprise, image, pays, ville, password_hash, is_email_verified, is_visible) 
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         nom,
//         prenom,
//         email,
//         telephone,
//         sexe,
//         ecole,
//         entreprise,
//         pays,
//         ville,
//         image,
//         password_hash,
//         is_email_verified,
//         is_visible
//       ]
//     );

//     return result.insertId;
//   }

//   // 🔹 Trouver un utilisateur par email
//   static async findByEmail(email) {
//     const [rows] = await pool.execute(
//       "SELECT * FROM users WHERE email = ?",
//       [email]
//     );
//     return rows[0];
//   }

//   // 🔹 Trouver un utilisateur par ID
//   static async findById(id) {
//     const [rows] = await pool.execute(
//       "SELECT * FROM users WHERE id = ?",
//       [id]
//     );
//     return rows[0];
//   }

//   // 🔹 Mise à jour d'un utilisateur
//   static async update(id, updateData) {
//     const fields = Object.keys(updateData).map(key => `${key} = ?`).join(", ");
//     const values = Object.values(updateData);
//     values.push(id);

//     const [result] = await pool.execute(
//       `UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
//       values
//     );

//     return result.affectedRows;
//   }

//   // 🔹 Suppression d'un utilisateur
//   static async delete(id) {
//     const [result] = await pool.execute(
//       "DELETE FROM users WHERE id = ?",
//       [id]
//     );
//     return result.affectedRows;
//   }

//   // 🔹 Récupérer tous les utilisateurs visibles
//   static async findAll(limit = 10, offset = 0) {
//     const [rows] = await pool.execute(
//       "SELECT * FROM users WHERE is_visible = TRUE LIMIT ? OFFSET ?",
//       [limit, offset]
//     );
//     return rows;
//   }

//   // // 🔹 Recherche par pays & ville
//   // static async findByLocation(pays, ville, limit = 10, offset = 0) {
//   //   const [rows] = await pool.execute(
//   //     "SELECT * FROM users WHERE pays = ? AND ville = ? AND is_visible = TRUE LIMIT ? OFFSET ?",
//   //     [pays, ville, limit, offset]
//   //   );
//   //   return rows;
//   // }

//   // // 🔹 Recherche par école
//   // static async findByEcole(ecole, limit = 10, offset = 0) {
//   //   const [rows] = await pool.execute(
//   //     "SELECT * FROM users WHERE ecole = ? AND is_visible = TRUE LIMIT ? OFFSET ?",
//   //     [ecole, limit, offset]
//   //   );
//   //   return rows;
//   // }

//   // // 🔹 Recherche par entreprise
//   // static async findByEntreprise(entreprise, limit = 10, offset = 0) {
//   //   const [rows] = await pool.execute(
//   //     "SELECT * FROM users WHERE entreprise = ? AND is_visible = TRUE LIMIT ? OFFSET ?",
//   //     [entreprise, limit, offset]
//   //   );
//   //   return rows;
//   // }

//   // // 🔹 Recherche avancée multi-filtres (pays, ville, école, entreprise)
//   // static async findByFilters({ pays, ville, ecole, entreprise }, limit = 10, offset = 0) {
//   //   let query = "SELECT * FROM users WHERE is_visible = TRUE";
//   //   const values = [];

//   //   if (pays) {
//   //     query += " AND pays = ?";
//   //     values.push(pays);
//   //   }
//   //   if (ville) {
//   //     query += " AND ville = ?";
//   //     values.push(ville);
//   //   }
//   //   if (ecole) {
//   //     query += " AND ecole = ?";
//   //     values.push(ecole);
//   //   }
//   //   if (entreprise) {
//   //     query += " AND entreprise = ?";
//   //     values.push(entreprise);
//   //   }

//   //   query += " LIMIT ? OFFSET ?";
//   //   values.push(limit, offset);

//   //   const [rows] = await pool.execute(query, values);
//   //   return rows;
//   // }

//   // 🔹 Compter les utilisateurs visibles
//   static async count() {
//     const [rows] = await pool.execute(
//       "SELECT COUNT(*) as total FROM users WHERE is_visible = TRUE"
//     );
//     return rows[0].total;
//   }
// }

// export default UserModel;







// // import pool from "../config/db.js";

// // class UserModel {
// //   static async create(userData) {
// //     const {
// //       nom,
// //       prenom,
// //       email,
// //       telephone,
// //       sexe,
// //       pays,
// //       ville,
// //       ecole,
// //       entreprise,
// //       password_hash,
// //       is_email_verified = false,
// //       is_visible = true
// //     } = userData;

// //     const [result] = await pool.execute(
// //       `INSERT INTO users 
// //        (nom, prenom, email, telephone, sexe, ecole, entreprise, pays, ville, password_hash, is_email_verified, is_visible) 
// //        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
// //       [nom, prenom, email, telephone, sexe, ecole, entreprise, pays, ville, password_hash, is_email_verified, is_visible]
// //     );

// //     return result.insertId;
// //   }

// //   static async findByEmail(email) {
// //     const [rows] = await pool.execute(
// //       "SELECT * FROM users WHERE email = ?",
// //       [email]
// //     );
// //     return rows[0];
// //   }

// //   static async findById(id) {
// //     const [rows] = await pool.execute(
// //       "SELECT * FROM users WHERE id = ?",
// //       [id]
// //     );
// //     return rows[0];
// //   }

// //   static async update(id, updateData) {
// //     const fields = Object.keys(updateData).map(key => `${key} = ?`).join(", ");
// //     const values = Object.values(updateData);
// //     values.push(id);

// //     const [result] = await pool.execute(
// //       `UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
// //       values
// //     );

// //     return result.affectedRows;
// //   }

// //   static async delete(id) {
// //     const [result] = await pool.execute(
// //       "DELETE FROM users WHERE id = ?",
// //       [id]
// //     );
// //     return result.affectedRows;
// //   }

// //   static async findAll(limit = 10, offset = 0) {
// //     const [rows] = await pool.execute(
// //       "SELECT * FROM users WHERE is_visible = TRUE LIMIT ? OFFSET ?",
// //       [limit, offset]
// //     );
// //     return rows;
// //   }

// //   static async findByLocation(pays, ville, limit = 10, offset = 0) {
// //     const [rows] = await pool.execute(
// //       "SELECT * FROM users WHERE pays = ? AND ville = ? AND is_visible = TRUE LIMIT ? OFFSET ?",
// //       [pays, ville, limit, offset]
// //     );
// //     return rows;
// //   }

// //   static async findByEcole(ecole, limit = 10, offset = 0) {
// //     const [rows] = await pool.execute(
// //       "SELECT * FROM users WHERE ecole = ? AND is_visible = TRUE LIMIT ? OFFSET ?",
// //       [ecole, limit, offset]
// //     );
// //     return rows;
// //   }

// //   static async findByEntreprise(entreprise, limit = 10, offset = 0) {
// //     const [rows] = await pool.execute(
// //       "SELECT * FROM users WHERE entreprise = ? AND is_visible = TRUE LIMIT ? OFFSET ?",
// //       [entreprise, limit, offset]
// //     );
// //     return rows;
// //   }
  
// //   static async count() {
// //     const [rows] = await pool.execute(
// //       "SELECT COUNT(*) as total FROM users WHERE is_visible = TRUE"
// //     );
// //     return rows[0].total;
// //   }
// // }

// // export default UserModel;