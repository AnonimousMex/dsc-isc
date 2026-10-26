import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { requireCsrf } from '../lib/csrf.js';
import * as controller from '../controllers/teacherController.js';

export const teachersRouter = Router();

teachersRouter.get('/', optionalAuth, controller.list);
// Antes de "/:slug": si no, Express la trataría como el slug literal "openalex-search".
teachersRouter.get(
  '/openalex-search',
  requireAuth,
  requireRole('SUPERADMIN', 'EDITOR'),
  controller.searchOpenAlexAuthors,
);
teachersRouter.get('/:slug', controller.getBySlug);
teachersRouter.get('/:slug/articles', controller.getArticles);
teachersRouter.post('/', requireAuth, requireRole('SUPERADMIN', 'EDITOR'), requireCsrf, controller.create);
teachersRouter.put('/:id', requireAuth, requireRole('SUPERADMIN', 'EDITOR'), requireCsrf, controller.update);
teachersRouter.delete(
  '/:id',
  requireAuth,
  requireRole('SUPERADMIN', 'EDITOR'),
  requireCsrf,
  controller.remove,
);
