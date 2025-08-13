import { Router } from "express";
import { getTipos} from "../controllers/profile.controller";

const router = Router();

router.get("/", getTipos);

export default router;
