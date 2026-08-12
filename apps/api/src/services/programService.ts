import type { Prisma } from '@prisma/client';
import type { Program, ProgramInput } from '@dsc-isc/shared';
import { prisma } from '../lib/prisma.js';
import { toMediaAssetDto } from '../lib/mediaDto.js';
import { HttpError } from '../middleware/errorHandler.js';

const include = { reticulaImage: true, reticulaPdf: true } satisfies Prisma.ProgramInclude;
type ProgramRow = Prisma.ProgramGetPayload<{ include: typeof include }>;

function toDto(row: ProgramRow): Program {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    mission: row.mission,
    vision: row.vision,
    goals: row.goals,
    admissionProfile: row.admissionProfile,
    graduateProfile: JSON.parse(row.graduateProfile) as string[],
    actionField: row.actionField,
    videoUrl: row.videoUrl,
    reticulaImage: row.reticulaImage ? toMediaAssetDto(row.reticulaImage) : null,
    reticulaPdf: row.reticulaPdf ? toMediaAssetDto(row.reticulaPdf) : null,
  };
}

export async function listPrograms(): Promise<Program[]> {
  const rows = await prisma.program.findMany({ include, orderBy: { name: 'asc' } });
  return rows.map(toDto);
}

export async function getProgramBySlug(slug: string): Promise<Program> {
  const row = await prisma.program.findUnique({ where: { slug }, include });
  if (!row) throw new HttpError(404, 'Programa no encontrado');
  return toDto(row);
}

export async function createProgram(input: ProgramInput): Promise<Program> {
  const row = await prisma.program.create({
    data: {
      slug: input.slug,
      name: input.name,
      mission: input.mission,
      vision: input.vision,
      goals: input.goals,
      admissionProfile: input.admissionProfile,
      graduateProfile: JSON.stringify(input.graduateProfile),
      actionField: input.actionField,
      videoUrl: input.videoUrl || null,
      reticulaImageId: input.reticulaImageId || null,
      reticulaPdfId: input.reticulaPdfId || null,
    },
    include,
  });
  return toDto(row);
}

export async function updateProgram(slug: string, input: ProgramInput): Promise<Program> {
  const row = await prisma.program.update({
    where: { slug },
    data: {
      slug: input.slug,
      name: input.name,
      mission: input.mission,
      vision: input.vision,
      goals: input.goals,
      admissionProfile: input.admissionProfile,
      graduateProfile: JSON.stringify(input.graduateProfile),
      actionField: input.actionField,
      videoUrl: input.videoUrl || null,
      reticulaImageId: input.reticulaImageId || null,
      reticulaPdfId: input.reticulaPdfId || null,
    },
    include,
  });
  return toDto(row);
}

export async function deleteProgram(slug: string): Promise<void> {
  await prisma.program.delete({ where: { slug } });
}
