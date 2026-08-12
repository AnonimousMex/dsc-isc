import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { requireCsrf } from '../lib/csrf.js';
import * as controller from '../controllers/subjectController.js';

export const subjectsRouter = Router();

subjectsRouter.get('/', controller.listSubjects);
subjectsRouter.get('/:id', controller.getSubject);
subjectsRouter.post('/', requireAuth, requireRole('SUPERADMIN', 'EDITOR'), requireCsrf, controller.createSubject);
subjectsRouter.put('/:id', requireAuth, requireRole('SUPERADMIN', 'EDITOR'), requireCsrf, controller.updateSubject);
subjectsRouter.delete(
  '/:id',
  requireAuth,
  requireRole('SUPERADMIN', 'EDITOR'),
  requireCsrf,
  controller.deleteSubject,
);
