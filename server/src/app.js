// Server/src/app.js
import express from "express";
import path from "path";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/user.routes.js";
import locationRoutes from "./routes/location.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import messageRoutes from "./routes/message.routes.js";
// import donationRoutes from "./routes/donation.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";

const app = express();

// --------------------
// Middlewares globaux
// --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS global pour les API
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Helmet (sécurité globale, CORP désactivé pour gérer /uploads nous-mêmes)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(morgan("dev"));

// --------------------
// Fichiers statiques (/uploads)
// --------------------
app.use("/uploads", (req, res, next) => {
  const origin = req.headers.origin;
  const allowed = [process.env.FRONTEND_URL, "http://localhost:5173"];

  if (origin && allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  } else {
    res.setHeader(
      "Access-Control-Allow-Origin",
      process.env.FRONTEND_URL || "*"
    );
  }

  // Important → permet aux images d’être chargées cross-origin
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  next();
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/uploads", express.static(path.join(process.cwd(), "uploads")));


// --------------------
// Routes API
// --------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// app.use("/api", userRoutes);
app.use("/api/users", locationRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api", conversationRoutes);
app.use("/api", messageRoutes);
// app.use("/api/donations", donationRoutes);
app.use("/api/notifications", notificationRoutes);


// --------------------
// Gestion des erreurs
// --------------------
app.use(notFound);
app.use(errorHandler);

export default app;
