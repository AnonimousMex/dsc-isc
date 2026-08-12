import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { requireCsrf } from '../lib/csrf.js';
import * as controller from '../controllers/heroSlideController.js';

export const heroSlidesRouter = Router();

heroSlidesRouter.get('/', optionalAuth, controller.list);
heroSlidesRouter.post('/', requireAuth, requireRole('SUPERADMIN', 'EDITOR'), requireCsrf, controller.create);
heroSlidesRouter.put('/:id', requireAuth, requireRole('SUPERADMIN', 'EDITOR'), requireCsrf, controller.update);
heroSlidesRouter.delete(
  '/:id',
  requireAuth,
  requireRole('SUPERADMIN', 'EDITOR'),
  requireCsrf,
  controller.remove,
);
