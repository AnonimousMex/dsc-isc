import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { requireCsrf } from '../lib/csrf.js';
import * as controller from '../controllers/timelineController.js';

export const timelineRouter = Router();

timelineRouter.get('/', optionalAuth, controller.list);
timelineRouter.post('/', requireAuth, requireRole('SUPERADMIN', 'EDITOR'), requireCsrf, controller.create);
timelineRouter.put('/:id', requireAuth, requireRole('SUPERADMIN', 'EDITOR'), requireCsrf, controller.update);
timelineRouter.delete(
  '/:id',
  requireAuth,
  requireRole('SUPERADMIN', 'EDITOR'),
  requireCsrf,
  controller.remove,
);
