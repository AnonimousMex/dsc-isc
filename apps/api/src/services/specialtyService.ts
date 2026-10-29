import type { Prisma } from '@prisma/client';
import type { Specialty, SpecialtyInput } from '@dsc-isc/shared';
import { prisma } from '../lib/prisma.js';
import { toMediaAssetDto } from '../lib/mediaDto.js';
import { HttpError } from '../middleware/errorHandler.js';

const include = { image: true, reticulaPdf: true } satisfies Prisma.SpecialtyInclude;
type SpecialtyRow = Prisma.SpecialtyGetPayload<{ include: typeof include }>;

function toDto(row: SpecialtyRow): Specialty {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    image: row.image ? toMediaAssetDto(row.image) : null,
    reticulaUrl: row.reticulaUrl,
    reticulaPdf: row.reticulaPdf ? toMediaAssetDto(row.reticulaPdf) : null,
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
  await assertReticula(input.reticulaPdfId);
  const row = await prisma.specialty.create({
    data: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      imageId: input.imageId || null,
      reticulaUrl: input.reticulaUrl,
      reticulaPdfId: input.reticulaPdfId,
    },
    include,
  });
  return toDto(row);
}

export async function updateSpecialty(id: string, input: SpecialtyInput): Promise<Specialty> {
  await assertReticula(input.reticulaPdfId);
  const row = await prisma.specialty.update({
    where: { id },
    data: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      imageId: input.imageId || null,
      reticulaUrl: input.reticulaUrl,
      reticulaPdfId: input.reticulaPdfId,
    },
    include,
  });
  return toDto(row);
}

export async function deleteSpecialty(id: string): Promise<void> {
  if (await prisma.subject.count({ where: { specialtyId: id } }))
    throw new HttpError(
      409,
      'Reasigna o elimina las materias de esta especialidad antes de eliminarla.',
    );
  await prisma.specialty.delete({ where: { id } });
}

async function assertReticula(id?: string | null) {
  if (!id) return;
  const media = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!media || media.kind !== 'DOCUMENT')
    throw new HttpError(400, 'Selecciona un documento válido para la retícula.');
}
