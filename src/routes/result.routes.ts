import { Router } from "express";
import { calcularPerfil, getPerfilUsuario } from "../controllers/result.controller";

const router = Router();

router.post("/calcular", calcularPerfil);
router.get("/:idUsuario", getPerfilUsuario);

export default router;
