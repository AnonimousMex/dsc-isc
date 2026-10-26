import { pathParam } from '../lib/params.js';
import type { Request, Response } from 'express';
import { presentationSchema, PRESENTATION_KEY, siteConfigSchema } from '@dsc-isc/shared';
import { asyncHandler } from '../lib/asyncHandler.js';
import { recordAudit } from '../lib/audit.js';
import * as service from '../services/siteConfigService.js';

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await service.listSiteConfig());
});

export const upsert = asyncHandler(async (req: Request, res: Response) => {
  const input = siteConfigSchema.parse({ key: pathParam(req, 'key'), value: req.body.value });
  const value =
    input.key === PRESENTATION_KEY ? presentationSchema.parse(input.value) : input.value;
  const config = await service.upsertSiteConfig(input.key, value, req.user!.id);
  await recordAudit({
    userId: req.user!.id,
    action: 'UPDATE',
    entityType: 'SiteConfig',
    entityId: config.key,
    after: config,
  });
  res.json(config);
});
