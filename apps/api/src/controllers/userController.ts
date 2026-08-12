import { pathParam } from '../lib/params.js';
import type { Request, Response } from 'express';
import { userCreateSchema, userUpdateSchema } from '@dsc-isc/shared';
import { asyncHandler } from '../lib/asyncHandler.js';
import { recordAudit } from '../lib/audit.js';
import * as userService from '../services/userService.js';

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await userService.listUsers());
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = userCreateSchema.parse(req.body);
  const user = await userService.createUser(input);
  await recordAudit({ userId: req.user!.id, action: 'CREATE', entityType: 'User', entityId: user.id, after: user });
  res.status(201).json(user);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = userUpdateSchema.parse(req.body);
  const before = await userService.getUserById(pathParam(req, 'id'));
  const user = await userService.updateUser(pathParam(req, 'id'), input);
  await recordAudit({
    userId: req.user!.id,
    action: 'UPDATE',
    entityType: 'User',
    entityId: user.id,
    before,
    after: user,
  });
  res.json(user);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const before = await userService.getUserById(pathParam(req, 'id'));
  await userService.deactivateUser(pathParam(req, 'id'), req.user!.id);
  await recordAudit({
    userId: req.user!.id,
    action: 'UPDATE',
    entityType: 'User',
    entityId: pathParam(req, 'id'),
    before,
    after: { ...before, isActive: false },
  });
  res.status(204).send();
});
