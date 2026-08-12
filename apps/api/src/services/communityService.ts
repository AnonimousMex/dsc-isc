import type { CommunitySection, CommunitySectionInput } from '@dsc-isc/shared';
import { prisma } from '../lib/prisma.js';
import { sanitizeRichText } from '../lib/sanitizeHtml.js';
import { HttpError } from '../middleware/errorHandler.js';

function toDto(row: { id: string; slug: string; title: string; body: string; documents: string | null }): CommunitySection {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    body: row.body,
    documentIds: row.documents ? (JSON.parse(row.documents) as string[]) : [],
  };
}

export async function listCommunitySections(): Promise<CommunitySection[]> {
  const rows = await prisma.communitySection.findMany({ orderBy: { title: 'asc' } });
  return rows.map(toDto);
}

export async function getCommunitySectionBySlug(slug: string): Promise<CommunitySection> {
  const row = await prisma.communitySection.findUnique({ where: { slug } });
  if (!row) throw new HttpError(404, 'Sección no encontrada');
  return toDto(row);
}

export async function getCommunitySectionById(id: string): Promise<CommunitySection> {
  const row = await prisma.communitySection.findUnique({ where: { id } });
  if (!row) throw new HttpError(404, 'Sección no encontrada');
  return toDto(row);
}

export async function createCommunitySection(input: CommunitySectionInput): Promise<CommunitySection> {
  const row = await prisma.communitySection.create({
    data: {
      slug: input.slug,
      title: input.title,
      body: sanitizeRichText(input.body),
      documents: JSON.stringify(input.documentIds),
    },
  });
  return toDto(row);
}

export async function updateCommunitySection(id: string, input: CommunitySectionInput): Promise<CommunitySection> {
  const row = await prisma.communitySection.update({
    where: { id },
    data: {
      slug: input.slug,
      title: input.title,
      body: sanitizeRichText(input.body),
      documents: JSON.stringify(input.documentIds),
    },
  });
  return toDto(row);
}

export async function deleteCommunitySection(id: string): Promise<void> {
  await prisma.communitySection.delete({ where: { id } });
}
