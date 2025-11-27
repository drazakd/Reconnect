// Server/src/config/env.js
import { config } from "@dotenvx/dotenvx";
import path from "path";
import { fileURLToPath } from "url";

// Correction du chemin
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({
  path: path.resolve(__dirname, "/app/.env"),
});

export const PORT = process.env.PORT;
export const DB_HOST = process.env.DB_HOST;
export const DB_USER = process.env.DB_USER;
export const DB_PASS = process.env.DB_PASS;
export const DB_NAME = process.env.DB_NAME;
export const JWT_SECRET = process.env.JWT_SECRET;
export const FRONTEND_URL = process.env.FRONTEND_URL;





// import dotenv from "dotenv";
// dotenv.config();

// export const PORT = process.env.PORT;
// export const DB_HOST = process.env.DB_HOST || "localhost";
// export const DB_USER = process.env.DB_USER || "root";
// export const DB_PASS = process.env.DB_PASS || "";
// export const DB_NAME = process.env.DB_NAME || "reconnect_app_db";
// export const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
