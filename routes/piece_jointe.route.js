import { Router } from 'express';
import { download } from '../controllers/piece_jointe.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/:id/file', download);

export default router;
