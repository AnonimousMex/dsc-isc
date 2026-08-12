import { pathParam } from '../lib/params.js';
import type { Request, Response } from 'express';
import { heroSlideSchema } from '@dsc-isc/shared';
import { asyncHandler } from '../lib/asyncHandler.js';
import { recordAudit } from '../lib/audit.js';
import * as service from '../services/heroSlideService.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.listHeroSlides(Boolean(req.user)));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = heroSlideSchema.parse(req.body);
  const slide = await service.createHeroSlide(input);
  await recordAudit({
    userId: req.user!.id,
    action: 'CREATE',
    entityType: 'HeroSlide',
    entityId: slide.id,
    after: slide,
  });
  res.status(201).json(slide);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = heroSlideSchema.parse(req.body);
  const before = await service.getHeroSlideById(pathParam(req, 'id'));
  const slide = await service.updateHeroSlide(pathParam(req, 'id'), input);
  await recordAudit({
    userId: req.user!.id,
    action: 'UPDATE',
    entityType: 'HeroSlide',
    entityId: slide.id,
    before,
    after: slide,
  });
  res.json(slide);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const before = await service.getHeroSlideById(pathParam(req, 'id'));
  await service.deleteHeroSlide(pathParam(req, 'id'));
  await recordAudit({
    userId: req.user!.id,
    action: 'DELETE',
    entityType: 'HeroSlide',
    entityId: pathParam(req, 'id'),
    before,
  });
  res.status(204).send();
});
