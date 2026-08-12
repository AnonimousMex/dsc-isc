import { pathParam } from '../lib/params.js';
import type { Request, Response } from 'express';
import { teacherSchema } from '@dsc-isc/shared';
import { asyncHandler } from '../lib/asyncHandler.js';
import { recordAudit } from '../lib/audit.js';
import * as teacherService from '../services/teacherService.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  res.json(await teacherService.listTeachers(Boolean(req.user)));
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  res.json(await teacherService.getTeacherBySlug(pathParam(req, 'slug')));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = teacherSchema.parse(req.body);
  const teacher = await teacherService.createTeacher(input);
  await recordAudit({
    userId: req.user!.id,
    action: 'CREATE',
    entityType: 'Teacher',
    entityId: teacher.id,
    after: teacher,
  });
  res.status(201).json(teacher);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = teacherSchema.parse(req.body);
  const before = await teacherService.getTeacherById(pathParam(req, 'id'));
  const teacher = await teacherService.updateTeacher(pathParam(req, 'id'), input);
  await recordAudit({
    userId: req.user!.id,
    action: 'UPDATE',
    entityType: 'Teacher',
    entityId: teacher.id,
    before,
    after: teacher,
  });
  res.json(teacher);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const before = await teacherService.getTeacherById(pathParam(req, 'id'));
  await teacherService.deleteTeacher(pathParam(req, 'id'));
  await recordAudit({
    userId: req.user!.id,
    action: 'DELETE',
    entityType: 'Teacher',
    entityId: pathParam(req, 'id'),
    before,
  });
  res.status(204).send();
});
