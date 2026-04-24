import { Router } from 'express';
import { removeAnnexe } from '../controllers/convention.controller.js';
import { authenticateBo } from '../middleware/bo.auth.js';

const router = Router();

router.use(authenticateBo);

router.delete('/:pieceJointeId', removeAnnexe);

export default router;
