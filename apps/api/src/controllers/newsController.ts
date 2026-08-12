import { pathParam } from '../lib/params.js';
import type { Request, Response } from 'express';
import { newsSchema } from '@dsc-isc/shared';
import { asyncHandler } from '../lib/asyncHandler.js';
import { recordAudit } from '../lib/audit.js';
import * as newsService from '../services/newsService.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  res.json(await newsService.listNews(Boolean(req.user)));
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  res.json(await newsService.getNewsBySlug(pathParam(req, 'slug')));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = newsSchema.parse(req.body);
  const news = await newsService.createNews(input);
  await recordAudit({ userId: req.user!.id, action: 'CREATE', entityType: 'News', entityId: news.id, after: news });
  res.status(201).json(news);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = newsSchema.parse(req.body);
  const before = await newsService.getNewsById(pathParam(req, 'id'));
  const news = await newsService.updateNews(pathParam(req, 'id'), input);
  await recordAudit({
    userId: req.user!.id,
    action: 'UPDATE',
    entityType: 'News',
    entityId: news.id,
    before,
    after: news,
  });
  res.json(news);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const before = await newsService.getNewsById(pathParam(req, 'id'));
  await newsService.deleteNews(pathParam(req, 'id'));
  await recordAudit({
    userId: req.user!.id,
    action: 'DELETE',
    entityType: 'News',
    entityId: pathParam(req, 'id'),
    before,
  });
  res.status(204).send();
});
