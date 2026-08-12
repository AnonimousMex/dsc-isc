import { pathParam } from '../lib/params.js';
import type { Request, Response } from 'express';
import { programSchema } from '@dsc-isc/shared';
import { asyncHandler } from '../lib/asyncHandler.js';
import { recordAudit } from '../lib/audit.js';
import * as programService from '../services/programService.js';

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await programService.listPrograms());
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  res.json(await programService.getProgramBySlug(pathParam(req, 'slug')));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = programSchema.parse(req.body);
  const program = await programService.createProgram(input);
  await recordAudit({
    userId: req.user!.id,
    action: 'CREATE',
    entityType: 'Program',
    entityId: program.id,
    after: program,
  });
  res.status(201).json(program);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = programSchema.parse(req.body);
  const before = await programService.getProgramBySlug(pathParam(req, 'slug'));
  const program = await programService.updateProgram(pathParam(req, 'slug'), input);
  await recordAudit({
    userId: req.user!.id,
    action: 'UPDATE',
    entityType: 'Program',
    entityId: program.id,
    before,
    after: program,
  });
  res.json(program);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const before = await programService.getProgramBySlug(pathParam(req, 'slug'));
  await programService.deleteProgram(pathParam(req, 'slug'));
  await recordAudit({
    userId: req.user!.id,
    action: 'DELETE',
    entityType: 'Program',
    entityId: before.id,
    before,
  });
  res.status(204).send();
});
