import { Router } from 'express';
import { list, create, update, remove } from '../controllers/rib.controller.js';
import { authenticate } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';

/* Scoped router : /api/structures/:structureId/ribs */
export const ribsByStructureRouter = Router({ mergeParams: true });
ribsByStructureRouter.use(authenticate);

ribsByStructureRouter.get('/', list);
ribsByStructureRouter.post('/', uploadSingle('fichier'), create);

/* Flat router : /api/ribs */
export const ribsFlatRouter = Router();
ribsFlatRouter.use(authenticate);

ribsFlatRouter.put('/:ribId', uploadSingle('fichier'), update);
ribsFlatRouter.delete('/:ribId', remove);
