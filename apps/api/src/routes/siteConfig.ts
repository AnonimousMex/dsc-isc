import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { requireCsrf } from '../lib/csrf.js';
import * as controller from '../controllers/siteConfigController.js';

export const siteConfigRouter = Router();

siteConfigRouter.get('/', controller.list);
siteConfigRouter.put(
  '/:key',
  requireAuth,
  requireRole('SUPERADMIN', 'EDITOR'),
  requireCsrf,
  controller.upsert,
);
