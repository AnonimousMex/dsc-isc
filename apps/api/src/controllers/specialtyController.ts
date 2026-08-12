import { pathParam } from '../lib/params.js';
import type { Request, Response } from 'express';
import { specialtySchema } from '@dsc-isc/shared';
import { asyncHandler } from '../lib/asyncHandler.js';
import { recordAudit } from '../lib/audit.js';
import * as specialtyService from '../services/specialtyService.js';

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await specialtyService.listSpecialties());
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  res.json(await specialtyService.getSpecialtyBySlug(pathParam(req, 'slug')));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = specialtySchema.parse(req.body);
  const specialty = await specialtyService.createSpecialty(input);
  await recordAudit({
    userId: req.user!.id,
    action: 'CREATE',
    entityType: 'Specialty',
    entityId: specialty.id,
    after: specialty,
  });
  res.status(201).json(specialty);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = specialtySchema.parse(req.body);
  const before = await specialtyService.getSpecialtyById(pathParam(req, 'id'));
  const specialty = await specialtyService.updateSpecialty(pathParam(req, 'id'), input);
  await recordAudit({
    userId: req.user!.id,
    action: 'UPDATE',
    entityType: 'Specialty',
    entityId: specialty.id,
    before,
    after: specialty,
  });
  res.json(specialty);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const before = await specialtyService.getSpecialtyById(pathParam(req, 'id'));
  await specialtyService.deleteSpecialty(pathParam(req, 'id'));
  await recordAudit({
    userId: req.user!.id,
    action: 'DELETE',
    entityType: 'Specialty',
    entityId: pathParam(req, 'id'),
    before,
  });
  res.status(204).send();
});
