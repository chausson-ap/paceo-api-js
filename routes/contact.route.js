import { Router } from 'express';
import { list, create, update, remove } from '../controllers/contact.controller.js';
import { authenticate } from '../middleware/auth.js';

/* Scoped router : /api/structures/:structureId/contacts */
export const contactsByStructureRouter = Router({ mergeParams: true });
contactsByStructureRouter.use(authenticate);

contactsByStructureRouter.get('/', list);
contactsByStructureRouter.post('/', create);

/* Flat router : /api/contacts */
export const contactsFlatRouter = Router();
contactsFlatRouter.use(authenticate);

contactsFlatRouter.put('/:contactId', update);
contactsFlatRouter.delete('/:contactId', remove);
