import { fileTypeFromBuffer } from 'file-type';
import type { ExternalMediaInput, MediaAsset, MediaKind } from '@dsc-isc/shared';
import { prisma } from '../lib/prisma.js';
import { toMediaAssetDto } from '../lib/mediaDto.js';
import { storage } from '../storage/index.js';
import type { StorageFolder } from '../storage/StorageAdapter.js';
import { HttpError } from '../middleware/errorHandler.js';

const ALLOWED_MIME_TO_FOLDER: Record<string, { folder: StorageFolder; kind: MediaKind }> = {
  'image/jpeg': { folder: 'images', kind: 'IMAGE' },
  'image/png': { folder: 'images', kind: 'IMAGE' },
  'image/webp': { folder: 'images', kind: 'IMAGE' },
  'image/gif': { folder: 'images', kind: 'IMAGE' },
  'video/mp4': { folder: 'videos', kind: 'VIDEO' },
  'video/webm': { folder: 'videos', kind: 'VIDEO' },
  'application/pdf': { folder: 'documents', kind: 'DOCUMENT' },
};

const MAX_BYTES_BY_KIND: Record<MediaKind, number> = {
  IMAGE: 5 * 1024 * 1024,
  VIDEO: 100 * 1024 * 1024,
  DOCUMENT: 15 * 1024 * 1024,
};

export async function saveUploadedMedia(
  buffer: Buffer,
  originalName: string,
  alt: string | undefined,
): Promise<MediaAsset> {
  // Nunca se confía en el mimetype declarado por el navegador: se detecta
  // el tipo real a partir de los primeros bytes del archivo (magic
  // numbers). Esto evita, por ejemplo, subir un .html renombrado a .jpg.
  const detected = await fileTypeFromBuffer(buffer);
  const mapping = detected ? ALLOWED_MIME_TO_FOLDER[detected.mime] : undefined;
  if (!detected || !mapping) {
    throw new HttpError(415, 'Tipo de archivo no soportado (solo JPEG, PNG, WEBP, GIF, MP4, WEBM o PDF)');
  }

  const maxBytes = MAX_BYTES_BY_KIND[mapping.kind];
  if (buffer.byteLength > maxBytes) {
    throw new HttpError(413, `El archivo excede el límite de ${Math.round(maxBytes / (1024 * 1024))}MB`);
  }

  const saved = await storage.save(buffer, {
    originalName,
    mimeType: detected.mime,
    folder: mapping.folder,
  });

  const row = await prisma.mediaAsset.create({
    data: { kind: mapping.kind, sourceType: 'LOCAL', path: saved.path, alt: alt ?? null },
  });
  return toMediaAssetDto(row);
}

export async function registerExternalMedia(input: ExternalMediaInput): Promise<MediaAsset> {
  const row = await prisma.mediaAsset.create({
    data: { kind: input.kind, sourceType: 'EXTERNAL', path: input.url, alt: input.alt ?? null },
  });
  return toMediaAssetDto(row);
}

export async function deleteMedia(id: string): Promise<void> {
  const row = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!row) throw new HttpError(404, 'Archivo no encontrado');

  await prisma.mediaAsset.delete({ where: { id } });
  if (row.sourceType === 'LOCAL') {
    await storage.delete(row.path);
  }
}
