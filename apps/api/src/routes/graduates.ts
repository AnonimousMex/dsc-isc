import { Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { graduateReviewSchema } from '@dsc-isc/shared';
import { asyncHandler } from '../lib/asyncHandler.js';
import { pathParam } from '../lib/params.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { requireCsrf } from '../lib/csrf.js';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';
import * as service from '../services/graduateService.js';

export const graduatesRouter = Router();
const registrationLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiadas solicitudes. Intenta de nuevo en una hora.' } });
const registrationUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024, files: 3, fields: 1, fieldSize: 32 * 1024, parts: 4 } });

graduatesRouter.get('/', asyncHandler(async (_req, res) => res.json(await service.listGraduates())));
graduatesRouter.post('/register', registrationLimit,
  registrationUpload.fields([{ name: 'diploma', maxCount: 1 }, { name: 'photo', maxCount: 1 }, { name: 'curriculum', maxCount: 1 }]),
  asyncHandler(async (req, res) => {
    let payload: unknown;
    try { payload = JSON.parse(req.body.profile); }
    catch { throw new HttpError(400, 'Los datos del perfil no son válidos'); }
    await service.registerGraduate(payload, (req.files ?? {}) as { [fieldname: string]: Express.Multer.File[] });
    res.status(201).json({ message: 'Recibimos tu solicitud. Tu perfil aparecerá después de que el administrador verifique tu título.' });
  }),
);

// Comprobar permisos actuales en BD también para los documentos privados.
graduatesRouter.use('/admin', requireAuth, requireRole('SUPERADMIN', 'EDITOR'), asyncHandler(async (req, _res, next) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { isActive: true, role: true, mustChangePassword: true } });
  if (!user?.isActive || !['SUPERADMIN', 'EDITOR'].includes(user.role) || user.mustChangePassword) throw new HttpError(403, 'No tienes permiso para revisar solicitudes');
  next();
}));
graduatesRouter.get('/admin/applications', asyncHandler(async (_req, res) => res.json(await service.listApplications())));

graduatesRouter.put('/admin/:id', requireCsrf,
  registrationUpload.fields([{ name: 'photo', maxCount: 1 }, { name: 'curriculum', maxCount: 1 }]),
  asyncHandler(async (req, res) => {
    let payload: unknown;
    try { payload = JSON.parse(req.body.profile); }
    catch { throw new HttpError(400, 'Los datos del perfil no son válidos'); }
    await service.updateGraduate(pathParam(req, 'id'), req.user!.id, payload, (req.files ?? {}) as { [fieldname: string]: Express.Multer.File[] });
    res.status(204).send();
  }),
);
graduatesRouter.put('/admin/:id/review', requireCsrf, asyncHandler(async (req, res) => {
  const input = graduateReviewSchema.parse(req.body);
  await service.reviewGraduate(pathParam(req, 'id'), req.user!.id, input.status, input.reviewNote);
  res.status(204).send();
}));

function serveFile(admin: boolean) {
  return asyncHandler(async (req, res) => {
    const kind = pathParam(req, 'kind');
    const file = await service.getGraduateFile(pathParam(req, 'id'), kind, admin);
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', `${kind === 'photo' ? 'inline' : 'attachment'}; filename="${kind}.${file.mime === 'application/pdf' ? 'pdf' : file.mime.split('/')[1]}"`);
    res.type(file.mime).send(file.bytes);
  });
}
graduatesRouter.get('/admin/:id/files/:kind', serveFile(true));
graduatesRouter.get('/:id/files/:kind', serveFile(false));
graduatesRouter.get('/:id', asyncHandler(async (req, res) => res.json(await service.getGraduate(pathParam(req, 'id')))));
