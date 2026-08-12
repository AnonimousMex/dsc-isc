import type { Prisma } from '@prisma/client';
import type { DocumentInput, DscDocument } from '@dsc-isc/shared';
import { prisma } from '../lib/prisma.js';
import { toMediaAssetDto } from '../lib/mediaDto.js';
import { HttpError } from '../middleware/errorHandler.js';

const include = { media: true } satisfies Prisma.DocumentInclude;
type DocumentRow = Prisma.DocumentGetPayload<{ include: typeof include }>;

function toDto(row: DocumentRow): DscDocument {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    media: toMediaAssetDto(row.media),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listDocuments(filters: { category?: string; q?: string }): Promise<DscDocument[]> {
  const rows = await prisma.document.findMany({
    where: {
      category: filters.category || undefined,
      title: filters.q ? { contains: filters.q } : undefined,
    },
    include,
    orderBy: { updatedAt: 'desc' },
  });
  return rows.map(toDto);
}

export async function getDocumentById(id: string): Promise<DscDocument> {
  const row = await prisma.document.findUnique({ where: { id }, include });
  if (!row) throw new HttpError(404, 'Documento no encontrado');
  return toDto(row);
}

export async function createDocument(input: DocumentInput): Promise<DscDocument> {
  const row = await prisma.document.create({
    data: { title: input.title, category: input.category, mediaId: input.mediaId },
    include,
  });
  return toDto(row);
}

export async function updateDocument(id: string, input: DocumentInput): Promise<DscDocument> {
  const row = await prisma.document.update({
    where: { id },
    data: { title: input.title, category: input.category, mediaId: input.mediaId },
    include,
  });
  return toDto(row);
}

export async function deleteDocument(id: string): Promise<void> {
  await prisma.document.delete({ where: { id } });
}
