import { Router } from 'express';
import type { AuditLog } from '@dsc-isc/shared';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { prisma } from '../lib/prisma.js';

export const auditLogsRouter = Router();

auditLogsRouter.use(requireAuth, requireRole('SUPERADMIN'));

auditLogsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const take = Math.min(Number(req.query.take) || 50, 200);
    const rows = await prisma.auditLog.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take,
    });
    const dtos: AuditLog[] = rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      userName: row.user.name,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      before: row.before ? JSON.parse(row.before) : null,
      after: row.after ? JSON.parse(row.after) : null,
      createdAt: row.createdAt.toISOString(),
    }));
    res.json(dtos);
  }),
);
