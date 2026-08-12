import type { Prisma } from '@prisma/client';
import type { Lab, LabInput } from '@dsc-isc/shared';
import { prisma } from '../lib/prisma.js';
import { toMediaAssetDto } from '../lib/mediaDto.js';
import { HttpError } from '../middleware/errorHandler.js';

const include = { gallery: { include: { media: true }, orderBy: { order: 'asc' } } } satisfies Prisma.LabInclude;
type LabRow = Prisma.LabGetPayload<{ include: typeof include }>;

function toDto(row: LabRow): Lab {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    equipment: JSON.parse(row.equipment) as Lab['equipment'],
    relatedSubjects: row.relatedSubjects ? (JSON.parse(row.relatedSubjects) as string[]) : [],
    gallery: row.gallery.map((g) => toMediaAssetDto(g.media)),
  };
}

export async function listLabs(): Promise<Lab[]> {
  const rows = await prisma.lab.findMany({ include, orderBy: { name: 'asc' } });
  return rows.map(toDto);
}

export async function getLabBySlug(slug: string): Promise<Lab> {
  const row = await prisma.lab.findUnique({ where: { slug }, include });
  if (!row) throw new HttpError(404, 'Laboratorio no encontrado');
  return toDto(row);
}

export async function getLabById(id: string): Promise<Lab> {
  const row = await prisma.lab.findUnique({ where: { id }, include });
  if (!row) throw new HttpError(404, 'Laboratorio no encontrado');
  return toDto(row);
}

async function setGallery(labId: string, mediaIds: string[]) {
  await prisma.labImage.deleteMany({ where: { labId } });
  if (mediaIds.length > 0) {
    await prisma.labImage.createMany({
      data: mediaIds.map((mediaId, order) => ({ labId, mediaId, order })),
    });
  }
}

export async function createLab(input: LabInput): Promise<Lab> {
  const created = await prisma.lab.create({
    data: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      equipment: JSON.stringify(input.equipment),
      relatedSubjects: JSON.stringify(input.relatedSubjects),
    },
  });
  await setGallery(created.id, input.galleryMediaIds);
  return getLabById(created.id);
}

export async function updateLab(id: string, input: LabInput): Promise<Lab> {
  await prisma.lab.update({
    where: { id },
    data: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      equipment: JSON.stringify(input.equipment),
      relatedSubjects: JSON.stringify(input.relatedSubjects),
    },
  });
  await setGallery(id, input.galleryMediaIds);
  return getLabById(id);
}

export async function deleteLab(id: string): Promise<void> {
  await prisma.lab.delete({ where: { id } });
}
