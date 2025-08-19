// routes/actions.routes.ts
import { Router } from 'express';
import { AcoesMercado } from '../../controllers/actions.controller';

const router = Router();

router.get('/', AcoesMercado); 

export default router;
