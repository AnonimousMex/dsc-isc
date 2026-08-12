import { pathParam } from '../lib/params.js';
import type { Request, Response } from 'express';
import { labSchema } from '@dsc-isc/shared';
import { asyncHandler } from '../lib/asyncHandler.js';
import { recordAudit } from '../lib/audit.js';
import * as labService from '../services/labService.js';

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await labService.listLabs());
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  res.json(await labService.getLabBySlug(pathParam(req, 'slug')));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = labSchema.parse(req.body);
  const lab = await labService.createLab(input);
  await recordAudit({ userId: req.user!.id, action: 'CREATE', entityType: 'Lab', entityId: lab.id, after: lab });
  res.status(201).json(lab);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = labSchema.parse(req.body);
  const before = await labService.getLabById(pathParam(req, 'id'));
  const lab = await labService.updateLab(pathParam(req, 'id'), input);
  await recordAudit({
    userId: req.user!.id,
    action: 'UPDATE',
    entityType: 'Lab',
    entityId: lab.id,
    before,
    after: lab,
  });
  res.json(lab);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const before = await labService.getLabById(pathParam(req, 'id'));
  await labService.deleteLab(pathParam(req, 'id'));
  await recordAudit({
    userId: req.user!.id,
    action: 'DELETE',
    entityType: 'Lab',
    entityId: pathParam(req, 'id'),
    before,
  });
  res.status(204).send();
});
