import { Router } from "express";
import { getEmergingTechStocks } from "../../controllers/controllers.agressivo/emergingTech.controller";

const router = Router();

// Buscar vários tickers de uma vez
router.get("/emerging-tech", getEmergingTechStocks); // via query ?tickers=AAPL,TSLA
router.post("/emerging-tech", getEmergingTechStocks); // via body { "tickers": ["AAPL", "TSLA"] }

export default router;
