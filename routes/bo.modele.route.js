import { Router } from 'express';
import { list, getOne, create, update, remove, preview } from '../controllers/modele.controller.js';
import {
  list as listArticles,
  create as createArticle,
  update as updateArticle,
  remove as removeArticle,
  reorder as reorderArticles,
} from '../controllers/modele_article.controller.js';
import {
  list as listVus,
  create as createVu,
  update as updateVu,
  remove as removeVu,
  reorder as reorderVus,
} from '../controllers/modele_vu.controller.js';
import { authenticateBo } from '../middleware/bo.auth.js';

const router = Router();

router.use(authenticateBo);

// Modèles
router.get('/', list);
router.post('/', create);

// Articles : routes flat (avant les routes paramétrées sur :id) pour éviter
// la collision avec /:modeleId/articles si "articles" était capturé comme :id.
router.put('/articles/:articleId', updateArticle);
router.delete('/articles/:articleId', removeArticle);

// Vus : routes flat (avant les routes paramétrées sur :id) pour éviter
// la collision avec /:modeleId/vus si "vus" était capturé comme :id.
router.put('/vus/:vuId', updateVu);
router.delete('/vus/:vuId', removeVu);

// Articles scopés par modèle
router.get('/:modeleId/articles', listArticles);
router.post('/:modeleId/articles', createArticle);
router.put('/:modeleId/articles/order', reorderArticles);

// Vus scopés par modèle
router.get('/:modeleId/vus', listVus);
router.post('/:modeleId/vus', createVu);
router.put('/:modeleId/vus/order', reorderVus);

// Aperçu PDF d'un modèle (placé avant /:id pour la lisibilité, mais les
// routes scopées /:id/articles/... et /:id/vus/... restent prioritaires
// car déclarées plus haut).
router.get('/:id/preview.pdf', preview);

// Modèle (par id), placés après pour ne pas masquer /articles/... et /vus/...
router.get('/:id', getOne);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
