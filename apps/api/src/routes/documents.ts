import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { requireCsrf } from '../lib/csrf.js';
import * as controller from '../controllers/documentController.js';

export const documentsRouter = Router();

documentsRouter.get('/', controller.list);
documentsRouter.post('/', requireAuth, requireRole('SUPERADMIN', 'EDITOR'), requireCsrf, controller.create);
documentsRouter.put('/:id', requireAuth, requireRole('SUPERADMIN', 'EDITOR'), requireCsrf, controller.update);
documentsRouter.delete(
  '/:id',
  requireAuth,
  requireRole('SUPERADMIN', 'EDITOR'),
  requireCsrf,
  controller.remove,
);
