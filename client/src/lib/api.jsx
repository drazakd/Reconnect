// ✅ src/lib/api.js
import axios from "axios";

// Création de l'instance Axios principale
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Intercepteur de requêtes — ajoute automatiquement le token JWT à chaque appel
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // ou sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Intercepteur de réponses — simplifie la structure des données reçues
api.interceptors.response.use(
  (response) => {
    // Si la réponse contient un objet { success: true, data: {...} }
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      // On renvoie la même réponse mais en remplaçant response.data par response.data.data
      return { ...response, data: response.data.data };
    }
    // Sinon, on renvoie la réponse telle quelle
    return response;
  },
  (error) => {
    // Gestion des erreurs globales (ex: 401, 500, etc.)
    if (error.response?.status === 401) {
      console.warn("🔒 Token invalide ou expiré — déconnexion possible");
      // → tu peux ici forcer une déconnexion si besoin
      // localStorage.removeItem("token");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
