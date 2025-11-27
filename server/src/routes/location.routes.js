import express from "express";
import { getPays, getVilles } from "../controllers/LocationController.js";

const router = express.Router();

router.get("/pays", getPays);
router.get("/villes/:pays", getVilles);

export default router;
