import type { Prisma } from '@prisma/client';
import type { News, NewsInput } from '@dsc-isc/shared';
import { prisma } from '../lib/prisma.js';
import { toMediaAssetDto } from '../lib/mediaDto.js';
import { sanitizeRichText } from '../lib/sanitizeHtml.js';
import { HttpError } from '../middleware/errorHandler.js';

const include = { coverImage: true } satisfies Prisma.NewsInclude;
type NewsRow = Prisma.NewsGetPayload<{ include: typeof include }>;

function toDto(row: NewsRow): News {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    coverImage: row.coverImage ? toMediaAssetDto(row.coverImage) : null,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    isPublished: row.isPublished,
  };
}

export async function listNews(includeUnpublished: boolean): Promise<News[]> {
  const rows = await prisma.news.findMany({
    where: includeUnpublished ? undefined : { isPublished: true },
    include,
    orderBy: { publishedAt: 'desc' },
  });
  return rows.map(toDto);
}

export async function getNewsBySlug(slug: string): Promise<News> {
  const row = await prisma.news.findUnique({ where: { slug }, include });
  if (!row) throw new HttpError(404, 'Noticia no encontrada');
  return toDto(row);
}

export async function getNewsById(id: string): Promise<News> {
  const row = await prisma.news.findUnique({ where: { id }, include });
  if (!row) throw new HttpError(404, 'Noticia no encontrada');
  return toDto(row);
}

export async function createNews(input: NewsInput): Promise<News> {
  const row = await prisma.news.create({
    data: {
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      body: sanitizeRichText(input.body),
      coverImageId: input.coverImageId || null,
      isPublished: input.isPublished,
      publishedAt: input.isPublished ? new Date() : null,
    },
    include,
  });
  return toDto(row);
}

export async function updateNews(id: string, input: NewsInput): Promise<News> {
  const existing = await prisma.news.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, 'Noticia no encontrada');

  const row = await prisma.news.update({
    where: { id },
    data: {
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      body: sanitizeRichText(input.body),
      coverImageId: input.coverImageId || null,
      isPublished: input.isPublished,
      publishedAt: input.isPublished ? (existing.publishedAt ?? new Date()) : null,
    },
    include,
  });
  return toDto(row);
}

export async function deleteNews(id: string): Promise<void> {
  await prisma.news.delete({ where: { id } });
}
