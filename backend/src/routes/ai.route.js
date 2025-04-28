import express from "express";
import { askGemini } from "../controllers/ai.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/reply", protectRoute, askGemini);

export default router;
