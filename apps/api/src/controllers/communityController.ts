import { pathParam } from '../lib/params.js';
import type { Request, Response } from 'express';
import { communitySectionSchema } from '@dsc-isc/shared';
import { asyncHandler } from '../lib/asyncHandler.js';
import { recordAudit } from '../lib/audit.js';
import * as communityService from '../services/communityService.js';

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await communityService.listCommunitySections());
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  res.json(await communityService.getCommunitySectionBySlug(pathParam(req, 'slug')));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = communitySectionSchema.parse(req.body);
  const section = await communityService.createCommunitySection(input);
  await recordAudit({
    userId: req.user!.id,
    action: 'CREATE',
    entityType: 'CommunitySection',
    entityId: section.id,
    after: section,
  });
  res.status(201).json(section);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = communitySectionSchema.parse(req.body);
  const before = await communityService.getCommunitySectionById(pathParam(req, 'id'));
  const section = await communityService.updateCommunitySection(pathParam(req, 'id'), input);
  await recordAudit({
    userId: req.user!.id,
    action: 'UPDATE',
    entityType: 'CommunitySection',
    entityId: section.id,
    before,
    after: section,
  });
  res.json(section);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const before = await communityService.getCommunitySectionById(pathParam(req, 'id'));
  await communityService.deleteCommunitySection(pathParam(req, 'id'));
  await recordAudit({
    userId: req.user!.id,
    action: 'DELETE',
    entityType: 'CommunitySection',
    entityId: pathParam(req, 'id'),
    before,
  });
  res.status(204).send();
});
