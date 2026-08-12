import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { requireCsrf } from '../lib/csrf.js';
import * as controller from '../controllers/userController.js';

// Gestión de usuarios: exclusiva de SUPERADMIN (sección 8).
export const usersRouter = Router();

usersRouter.use(requireAuth, requireRole('SUPERADMIN'));
usersRouter.get('/', controller.list);
usersRouter.post('/', requireCsrf, controller.create);
usersRouter.put('/:id', requireCsrf, controller.update);
usersRouter.delete('/:id', requireCsrf, controller.remove);
