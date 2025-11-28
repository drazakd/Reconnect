// Server/src/server.js
import http from "http";
import app from "./app.js";
import setupSocket from "./socket.js";
import { PORT } from "./config/env.js";

const server = http.createServer(app); // Crée un serveur HTTP avec Express
setupSocket(server); // Initialise socket.io avec gestion des événements

server.listen(PORT, () => {
  console.log(`🚀 Serveur HTTP+WebSocket actif sur ${PORT}`);
});




// // Server/src/server.js
// import app from "./app.js";
// import { PORT } from "./config/env.js";

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });