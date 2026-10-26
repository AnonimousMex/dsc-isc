import { pathParam } from '../lib/params.js';
import type { Request, Response } from 'express';
import { teacherSchema } from '@dsc-isc/shared';
import { asyncHandler } from '../lib/asyncHandler.js';
import { recordAudit } from '../lib/audit.js';
import { HttpError } from '../middleware/errorHandler.js';
import * as openAlexService from '../services/openAlexService.js';
import * as teacherService from '../services/teacherService.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  res.json(await teacherService.listTeachers(Boolean(req.user)));
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  res.json(await teacherService.getTeacherBySlug(pathParam(req, 'slug')));
});

export const getArticles = asyncHandler(async (req: Request, res: Response) => {
  const teacher = await teacherService.getTeacherBySlug(pathParam(req, 'slug'));
  if (!teacher.openAlexId) {
    res.json([]);
    return;
  }
  res.json(await openAlexService.fetchArticlesForAuthor(teacher.openAlexId));
});

// Solo para el admin: busca candidatos en OpenAlex por nombre, para que se
// elija a mano al investigador correcto antes de enlazarlo (ver notebook de
// referencia sobre el problema de homónimos).
export const searchOpenAlexAuthors = asyncHandler(async (req: Request, res: Response) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (q.length < 2) throw new HttpError(400, 'Escribe al menos 2 caracteres para buscar');
  res.json(await openAlexService.searchAuthors(q));
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
