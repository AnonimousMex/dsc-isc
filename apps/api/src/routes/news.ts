import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { requireCsrf } from '../lib/csrf.js';
import * as controller from '../controllers/newsController.js';

export const newsRouter = Router();

newsRouter.get('/', optionalAuth, controller.list);
newsRouter.get('/:slug', controller.getBySlug);
newsRouter.post('/', requireAuth, requireRole('SUPERADMIN', 'EDITOR'), requireCsrf, controller.create);
newsRouter.put('/:id', requireAuth, requireRole('SUPERADMIN', 'EDITOR'), requireCsrf, controller.update);
newsRouter.delete('/:id', requireAuth, requireRole('SUPERADMIN', 'EDITOR'), requireCsrf, controller.remove);
