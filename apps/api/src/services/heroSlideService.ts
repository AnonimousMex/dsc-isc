import type { Prisma } from '@prisma/client';
import type { HeroSlide, HeroSlideInput } from '@dsc-isc/shared';
import { prisma } from '../lib/prisma.js';
import { toMediaAssetDto } from '../lib/mediaDto.js';
import { HttpError } from '../middleware/errorHandler.js';

const include = { media: true } satisfies Prisma.HeroSlideInclude;
type HeroSlideRow = Prisma.HeroSlideGetPayload<{ include: typeof include }>;

function toDto(row: HeroSlideRow): HeroSlide {
  return {
    id: row.id,
    order: row.order,
    media: toMediaAssetDto(row.media),
    captionCode: row.captionCode,
    isActive: row.isActive,
  };
}

export async function listHeroSlides(includeInactive: boolean): Promise<HeroSlide[]> {
  const rows = await prisma.heroSlide.findMany({
    where: includeInactive ? undefined : { isActive: true },
    include,
    orderBy: { order: 'asc' },
  });
  return rows.map(toDto);
}

export async function getHeroSlideById(id: string): Promise<HeroSlide> {
  const row = await prisma.heroSlide.findUnique({ where: { id }, include });
  if (!row) throw new HttpError(404, 'Slide no encontrado');
  return toDto(row);
}

export async function createHeroSlide(input: HeroSlideInput): Promise<HeroSlide> {
  const row = await prisma.heroSlide.create({
    data: { order: input.order, mediaId: input.mediaId, captionCode: input.captionCode, isActive: input.isActive },
    include,
  });
  return toDto(row);
}

export async function updateHeroSlide(id: string, input: HeroSlideInput): Promise<HeroSlide> {
  const row = await prisma.heroSlide.update({
    where: { id },
    data: { order: input.order, mediaId: input.mediaId, captionCode: input.captionCode, isActive: input.isActive },
    include,
  });
  return toDto(row);
}

export async function deleteHeroSlide(id: string): Promise<void> {
  await prisma.heroSlide.delete({ where: { id } });
}
