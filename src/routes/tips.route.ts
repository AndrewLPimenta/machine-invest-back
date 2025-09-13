import { Router } from "express";
import { getTips, getRandomTip } from "../controllers/tips.controller";

const router = Router();

router.get("/dicas", getTips);       // todas as dicas para um usuário
router.get("/dica", getRandomTip);   // dica aleatória para um usuário

export default router;
