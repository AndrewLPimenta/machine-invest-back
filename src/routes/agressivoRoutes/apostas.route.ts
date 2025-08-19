
// routes/actions.routes.ts
import { Router } from 'express';
import { ApostaMercado } from '../../controllers/controllers.agressivo/aposta.controller';

const router = Router();

router.get('/', ApostaMercado); 

export default router;
