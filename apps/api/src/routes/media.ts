import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { requireCsrf } from '../lib/csrf.js';
import { upload } from '../middleware/upload.js';
import { deleteMedia, postExternal, postUpload } from '../controllers/mediaController.js';

export const mediaRouter = Router();

mediaRouter.post(
  '/upload',
  requireAuth,
  requireRole('SUPERADMIN', 'EDITOR'),
  requireCsrf,
  upload.single('file'),
  postUpload,
);
mediaRouter.post('/external', requireAuth, requireRole('SUPERADMIN', 'EDITOR'), requireCsrf, postExternal);
mediaRouter.delete('/:id', requireAuth, requireRole('SUPERADMIN', 'EDITOR'), requireCsrf, deleteMedia);
