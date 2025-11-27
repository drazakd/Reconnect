// Server/src/config/db.js
import mysql from "mysql2/promise";
import { DB_HOST, DB_USER, DB_PASS, DB_NAME } from "./env.js";

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// Test de connexion au démarrage
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connexion à la base de données réussie");
    connection.release();
  } catch (err) {
    console.error("❌ Erreur de connexion à la base de données:", err.message);
  }
})();

export default pool;