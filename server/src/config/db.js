import mysql from "mysql2/promise";
import { DB_HOST, DB_USER, DB_PASS, DB_NAME, PORT } from "./env.js";

const pool = mysql.createPool({
  host: DB_HOST,
  port: PORT,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
  ssl: {
    rejectUnauthorized: true, // ← obligatoire pour Aiven
  },
});

// Test connexion
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Connexion MySQL OK");
    conn.release();
  } catch (err) {
    console.error("❌ Erreur MySQL:", err);
  }
})();

export default pool;
