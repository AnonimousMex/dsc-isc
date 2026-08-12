import { pathParam } from '../lib/params.js';
import type { Request, Response } from 'express';
import { subjectSchema } from '@dsc-isc/shared';
import { asyncHandler } from '../lib/asyncHandler.js';
import { recordAudit } from '../lib/audit.js';
import * as subjectService from '../services/subjectService.js';

export const listSubjects = asyncHandler(async (req: Request, res: Response) => {
  const programId = typeof req.query.programId === 'string' ? req.query.programId : undefined;
  res.json(await subjectService.listSubjects(programId));
});

export const getSubject = asyncHandler(async (req: Request, res: Response) => {
  res.json(await subjectService.getSubject(pathParam(req, 'id')));
});

export const createSubject = asyncHandler(async (req: Request, res: Response) => {
  const input = subjectSchema.parse(req.body);
  const subject = await subjectService.createSubject(input);
  await recordAudit({
    userId: req.user!.id,
    action: 'CREATE',
    entityType: 'Subject',
    entityId: subject.id,
    after: subject,
  });
  res.status(201).json(subject);
});

export const updateSubject = asyncHandler(async (req: Request, res: Response) => {
  const input = subjectSchema.parse(req.body);
  const before = await subjectService.getSubject(pathParam(req, 'id'));
  const subject = await subjectService.updateSubject(pathParam(req, 'id'), input);
  await recordAudit({
    userId: req.user!.id,
    action: 'UPDATE',
    entityType: 'Subject',
    entityId: subject.id,
    before,
    after: subject,
  });
  res.json(subject);
});

export const deleteSubject = asyncHandler(async (req: Request, res: Response) => {
  const before = await subjectService.getSubject(pathParam(req, 'id'));
  await subjectService.deleteSubject(pathParam(req, 'id'));
  await recordAudit({
    userId: req.user!.id,
    action: 'DELETE',
    entityType: 'Subject',
    entityId: pathParam(req, 'id'),
    before,
  });
  res.status(204).send();
});
