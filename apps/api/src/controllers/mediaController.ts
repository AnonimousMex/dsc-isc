import { pathParam } from '../lib/params.js';
import type { Request, Response } from 'express';
import { externalMediaSchema } from '@dsc-isc/shared';
import { asyncHandler } from '../lib/asyncHandler.js';
import { recordAudit } from '../lib/audit.js';
import { HttpError } from '../middleware/errorHandler.js';
import * as mediaService from '../services/mediaService.js';

export const postUpload = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new HttpError(400, 'No se recibió ningún archivo (campo "file")');
  }
  const alt = typeof req.body?.alt === 'string' ? req.body.alt : undefined;
  const media = await mediaService.saveUploadedMedia(req.file.buffer, req.file.originalname, alt);
  await recordAudit({
    userId: req.user!.id,
    action: 'CREATE',
    entityType: 'MediaAsset',
    entityId: media.id,
    after: media,
  });
  res.status(201).json(media);
});

export const postExternal = asyncHandler(async (req: Request, res: Response) => {
  const input = externalMediaSchema.parse(req.body);
  const media = await mediaService.registerExternalMedia(input);
  await recordAudit({
    userId: req.user!.id,
    action: 'CREATE',
    entityType: 'MediaAsset',
    entityId: media.id,
    after: media,
  });
  res.status(201).json(media);
});

export const deleteMedia = asyncHandler(async (req: Request, res: Response) => {
  await mediaService.deleteMedia(pathParam(req, 'id'));
  await recordAudit({
    userId: req.user!.id,
    action: 'DELETE',
    entityType: 'MediaAsset',
    entityId: pathParam(req, 'id'),
  });
  res.status(204).send();
});
