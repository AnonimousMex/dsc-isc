import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { requireCsrf } from '../lib/csrf.js';
import * as controller from '../controllers/labController.js';

export const labsRouter = Router();

labsRouter.get('/', controller.list);
labsRouter.get('/:slug', controller.getBySlug);
labsRouter.post('/', requireAuth, requireRole('SUPERADMIN', 'EDITOR'), requireCsrf, controller.create);
labsRouter.put('/:id', requireAuth, requireRole('SUPERADMIN', 'EDITOR'), requireCsrf, controller.update);
labsRouter.delete('/:id', requireAuth, requireRole('SUPERADMIN', 'EDITOR'), requireCsrf, controller.remove);
