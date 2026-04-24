import { Router } from 'express';
import { list } from '../controllers/evenement.controller.js';
import { authenticateBo } from '../middleware/bo.auth.js';

const router = Router();

router.use(authenticateBo);

router.get('/', list);

export default router;
