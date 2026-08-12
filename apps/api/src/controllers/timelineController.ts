import { pathParam } from '../lib/params.js';
import type { Request, Response } from 'express';
import { timelineEventSchema } from '@dsc-isc/shared';
import { asyncHandler } from '../lib/asyncHandler.js';
import { recordAudit } from '../lib/audit.js';
import * as service from '../services/timelineService.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.listTimelineEvents(Boolean(req.user)));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = timelineEventSchema.parse(req.body);
  const event = await service.createTimelineEvent(input);
  await recordAudit({
    userId: req.user!.id,
    action: 'CREATE',
    entityType: 'TimelineEvent',
    entityId: event.id,
    after: event,
  });
  res.status(201).json(event);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = timelineEventSchema.parse(req.body);
  const before = await service.getTimelineEventById(pathParam(req, 'id'));
  const event = await service.updateTimelineEvent(pathParam(req, 'id'), input);
  await recordAudit({
    userId: req.user!.id,
    action: 'UPDATE',
    entityType: 'TimelineEvent',
    entityId: event.id,
    before,
    after: event,
  });
  res.json(event);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const before = await service.getTimelineEventById(pathParam(req, 'id'));
  await service.deleteTimelineEvent(pathParam(req, 'id'));
  await recordAudit({
    userId: req.user!.id,
    action: 'DELETE',
    entityType: 'TimelineEvent',
    entityId: pathParam(req, 'id'),
    before,
  });
  res.status(204).send();
});
