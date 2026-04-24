import { Router } from 'express';
import { list, create, update, remove } from '../controllers/modele.controller.js';
import { authenticateBo } from '../middleware/bo.auth.js';

const router = Router();

router.use(authenticateBo);

router.get('/', list);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
