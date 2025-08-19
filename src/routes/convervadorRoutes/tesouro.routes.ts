import { Router } from 'express';
import { fetchTesouro } from '../../controllers/controllers.conservador/tesouro.controller';

const router = Router();

router.get('/tesouro', fetchTesouro);

export default router;
