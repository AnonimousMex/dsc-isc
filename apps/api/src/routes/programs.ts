import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { requireCsrf } from '../lib/csrf.js';
import * as controller from '../controllers/programController.js';

export const programsRouter = Router();

programsRouter.get('/', controller.list);
programsRouter.get('/:slug', controller.getBySlug);
programsRouter.post('/', requireAuth, requireRole('SUPERADMIN', 'EDITOR'), requireCsrf, controller.create);
programsRouter.put('/:slug', requireAuth, requireRole('SUPERADMIN', 'EDITOR'), requireCsrf, controller.update);
programsRouter.delete(
  '/:slug',
  requireAuth,
  requireRole('SUPERADMIN', 'EDITOR'),
  requireCsrf,
  controller.remove,
);
