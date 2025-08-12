import { Router } from "express";
import { salvarRespostas } from "../controllers/answer.controller";

const router = Router();

router.post("/", salvarRespostas);

export default router;
