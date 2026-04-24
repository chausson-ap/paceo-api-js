import { Router } from 'express';
import {
  list,
  detail,
  detailByNom,
  update,
  uploadLogo,
  removeLogo,
  addAnnexe,
} from '../controllers/convention.controller.js';
import { authenticateBo } from '../middleware/bo.auth.js';
import { uploadSingle, uploadLogoSingle } from '../middleware/upload.js';

const router = Router();

router.use(authenticateBo);

router.get('/', list);
router.get('/by-nom/:nom', detailByNom);
router.get('/:id', detail);
router.put('/:id', update);
router.post('/:id/logo', uploadLogoSingle('fichier'), uploadLogo);
router.delete('/:id/logo', removeLogo);
router.post('/:id/annexes', uploadSingle('fichier'), addAnnexe);

export default router;
