import type { Prisma } from '@prisma/client';
import type { Specialty, SpecialtyInput } from '@dsc-isc/shared';
import { prisma } from '../lib/prisma.js';
import { toMediaAssetDto } from '../lib/mediaDto.js';
import { HttpError } from '../middleware/errorHandler.js';

const include = { image: true } satisfies Prisma.SpecialtyInclude;
type SpecialtyRow = Prisma.SpecialtyGetPayload<{ include: typeof include }>;

function toDto(row: SpecialtyRow): Specialty {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    image: row.image ? toMediaAssetDto(row.image) : null,
  };
}

export async function listSpecialties(): Promise<Specialty[]> {
  const rows = await prisma.specialty.findMany({ include, orderBy: { name: 'asc' } });
  return rows.map(toDto);
}

export async function getSpecialtyBySlug(slug: string): Promise<Specialty> {
  const row = await prisma.specialty.findUnique({ where: { slug }, include });
  if (!row) throw new HttpError(404, 'Especialidad no encontrada');
  return toDto(row);
}

export async function getSpecialtyById(id: string): Promise<Specialty> {
  const row = await prisma.specialty.findUnique({ where: { id }, include });
  if (!row) throw new HttpError(404, 'Especialidad no encontrada');
  return toDto(row);
}

export async function createSpecialty(input: SpecialtyInput): Promise<Specialty> {
  const row = await prisma.specialty.create({
    data: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      imageId: input.imageId || null,
    },
    include,
  });
  return toDto(row);
}

export async function updateSpecialty(id: string, input: SpecialtyInput): Promise<Specialty> {
  const row = await prisma.specialty.update({
    where: { id },
    data: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      imageId: input.imageId || null,
    },
    include,
  });
  return toDto(row);
}

export async function deleteSpecialty(id: string): Promise<void> {
  await prisma.specialty.delete({ where: { id } });
}
