import type { MediaAsset as MediaAssetRow } from '@prisma/client';
import type { MediaAsset } from '@dsc-isc/shared';
import { storage } from '../storage/index.js';

export function toMediaAssetDto(row: MediaAssetRow): MediaAsset {
  const url = row.sourceType === 'LOCAL' ? storage.getPublicUrl(row.path) : row.path;
  return {
    id: row.id,
    kind: row.kind as MediaAsset['kind'],
    sourceType: row.sourceType as MediaAsset['sourceType'],
    path: row.path,
    url,
    alt: row.alt,
    createdAt: row.createdAt.toISOString(),
  };
}
