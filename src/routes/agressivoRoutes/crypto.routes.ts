import { Router } from 'express';
import { getCotacao } from '../../controllers/controllers.agressivo/crypto.controller';

const router = Router();

router.get('/cotacao', getCotacao);

export default router;
