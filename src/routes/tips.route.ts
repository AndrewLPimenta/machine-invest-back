import { Router } from "express";
import { getTips, getRandomTip } from "../controllers/tips.controller";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

// Todas as rotas de dicas precisam de autenticação
router.get("/dicas", authenticate, getTips);       // todas as dicas
router.get("/dica", authenticate, getRandomTip);   // dica aleatória

export default router;
