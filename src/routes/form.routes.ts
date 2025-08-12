import { Router } from "express";
import { getFormulario } from "../controllers/form.controller";

const router = Router();

router.get("/:id", getFormulario);

export default router;
