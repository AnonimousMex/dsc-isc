import { pathParam } from '../lib/params.js';
import type { Request, Response } from 'express';
import { documentSchema } from '@dsc-isc/shared';
import { asyncHandler } from '../lib/asyncHandler.js';
import { recordAudit } from '../lib/audit.js';
import * as documentService from '../services/documentService.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;
  res.json(await documentService.listDocuments({ category, q }));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = documentSchema.parse(req.body);
  const doc = await documentService.createDocument(input);
  await recordAudit({
    userId: req.user!.id,
    action: 'CREATE',
    entityType: 'Document',
    entityId: doc.id,
    after: doc,
  });
  res.status(201).json(doc);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = documentSchema.parse(req.body);
  const before = await documentService.getDocumentById(pathParam(req, 'id'));
  const doc = await documentService.updateDocument(pathParam(req, 'id'), input);
  await recordAudit({
    userId: req.user!.id,
    action: 'UPDATE',
    entityType: 'Document',
    entityId: doc.id,
    before,
    after: doc,
  });
  res.json(doc);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const before = await documentService.getDocumentById(pathParam(req, 'id'));
  await documentService.deleteDocument(pathParam(req, 'id'));
  await recordAudit({
    userId: req.user!.id,
    action: 'DELETE',
    entityType: 'Document',
    entityId: pathParam(req, 'id'),
    before,
  });
  res.status(204).send();
});
