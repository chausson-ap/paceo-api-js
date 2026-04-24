import { Router } from 'express';
import { register, login, me } from '../controllers/bo.auth.controller.js';
import { authenticateBo } from '../middleware/bo.auth.js';
import { authLimiter } from '../middleware/rate-limit.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', authenticateBo, me);

export default router;
