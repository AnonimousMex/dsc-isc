import type { Prisma } from '@prisma/client';
import type { Teacher, TeacherInput, TeacherSummary } from '@dsc-isc/shared';
import { prisma } from '../lib/prisma.js';
import { toMediaAssetDto } from '../lib/mediaDto.js';
import { HttpError } from '../middleware/errorHandler.js';

const include = { photo: true, subjects: true } satisfies Prisma.TeacherInclude;
type TeacherRow = Prisma.TeacherGetPayload<{ include: typeof include }>;

function toDto(row: TeacherRow): Teacher {
  return {
    id: row.id,
    slug: row.slug,
    fullName: row.fullName,
    title: row.title,
    photo: row.photo ? toMediaAssetDto(row.photo) : null,
    isActive: row.isActive,
    bio: row.bio,
    experience: row.experience,
    youtubeUrl: row.youtubeUrl,
    email: row.email,
    website: row.website,
    linkedin: row.linkedin,
    facebook: row.facebook,
    twitter: row.twitter,
    subjectIds: row.subjects.map((s) => s.subjectId),
  };
}

function toSummaryDto(row: TeacherRow): TeacherSummary {
  return {
    id: row.id,
    slug: row.slug,
    fullName: row.fullName,
    title: row.title,
    photo: row.photo ? toMediaAssetDto(row.photo) : null,
    isActive: row.isActive,
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function listTeachers(includeInactive: boolean): Promise<TeacherSummary[]> {
  const rows = await prisma.teacher.findMany({
    where: includeInactive ? undefined : { isActive: true },
    include,
    orderBy: { fullName: 'asc' },
  });
  return rows.map(toSummaryDto);
}

export async function getTeacherBySlug(slug: string): Promise<Teacher> {
  const row = await prisma.teacher.findUnique({ where: { slug }, include });
  if (!row) throw new HttpError(404, 'Docente no encontrado');
  return toDto(row);
}

export async function getTeacherById(id: string): Promise<Teacher> {
  const row = await prisma.teacher.findUnique({ where: { id }, include });
  if (!row) throw new HttpError(404, 'Docente no encontrado');
  return toDto(row);
}

async function assignSubjects(teacherId: string, subjectIds: string[]) {
  await prisma.teacherSubject.deleteMany({ where: { teacherId } });
  if (subjectIds.length > 0) {
    await prisma.teacherSubject.createMany({
      data: subjectIds.map((subjectId) => ({ teacherId, subjectId })),
    });
  }
}

export async function createTeacher(input: TeacherInput): Promise<Teacher> {
  const slug = slugify(input.fullName);
  const created = await prisma.teacher.create({
    data: {
      slug,
      fullName: input.fullName,
      title: input.title,
      bio: input.bio,
      experience: input.experience,
      photoId: input.photoId || null,
      youtubeUrl: input.youtubeUrl || null,
      email: input.email || null,
      website: input.website || null,
      linkedin: input.linkedin || null,
      facebook: input.facebook || null,
      twitter: input.twitter || null,
      isActive: input.isActive,
    },
  });
  await assignSubjects(created.id, input.subjectIds);
  return getTeacherById(created.id);
}

export async function updateTeacher(id: string, input: TeacherInput): Promise<Teacher> {
  const slug = slugify(input.fullName);
  await prisma.teacher.update({
    where: { id },
    data: {
      slug,
      fullName: input.fullName,
      title: input.title,
      bio: input.bio,
      experience: input.experience,
      photoId: input.photoId || null,
      youtubeUrl: input.youtubeUrl || null,
      email: input.email || null,
      website: input.website || null,
      linkedin: input.linkedin || null,
      facebook: input.facebook || null,
      twitter: input.twitter || null,
      isActive: input.isActive,
    },
  });
  await assignSubjects(id, input.subjectIds);
  return getTeacherById(id);
}

export async function deleteTeacher(id: string): Promise<void> {
  await prisma.teacher.delete({ where: { id } });
}
