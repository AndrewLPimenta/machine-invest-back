import { Router } from "express";
import { getUsuario } from "../controllers/user.controller";

const router = Router();

router.get("/:id", getUsuario);

export default router;
