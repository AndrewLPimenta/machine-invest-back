import { Router } from 'express';
import { fetchTesouro } from '../controllers/tesouro.controller';

const router = Router();

// Rota GET para buscar títulos conservadores
router.get('/tesouro', fetchTesouro);

export default router;
