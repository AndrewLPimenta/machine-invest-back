import { Router } from "express";
import { sendMessage } from "../controllers/ai.controller";

const router = Router();
router.post("/ai/chat", sendMessage);

export default router;
