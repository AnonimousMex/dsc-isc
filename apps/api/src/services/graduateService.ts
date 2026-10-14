import type { Prisma } from '@prisma/client';
import { fileTypeFromBuffer } from 'file-type';
import { graduateEditSchema, graduateRegistrationSchema, type GraduateApplication, type GraduateProfile, type GraduateStatus } from '@dsc-isc/shared';
import { prisma } from '../lib/prisma.js';
import { env } from '../lib/env.js';
import { HttpError } from '../middleware/errorHandler.js';

// Nunca cargar ni serializar los documentos en listados o perfiles.
const select = {
  id: true, fullName: true, email: true, graduationYear: true, headline: true,
  bio: true, experience: true, city: true, website: true, linkedin: true,
  github: true, facebook: true, instagram: true, showEmail: true,
  status: true, reviewNote: true, reviewedAt: true, createdAt: true,
  photoMime: true, hasCurriculum: true,
} satisfies Prisma.GraduateSelect;
type GraduateRow = Prisma.GraduateGetPayload<{ select: typeof select }>;

function assetUrl(id: string, kind: string, admin = false) {
  return `${env.apiPublicUrl}/api/graduates/${admin ? 'admin/' : ''}${id}/files/${kind}`;
}

export function toGraduateProfile(row: GraduateRow, admin = false): GraduateProfile {
  return {
    id: row.id, fullName: row.fullName, graduationYear: row.graduationYear,
    headline: row.headline, bio: row.bio, experience: row.experience, city: row.city,
    email: admin || row.showEmail ? row.email : null,
    website: row.website, linkedin: row.linkedin, github: row.github,
    facebook: row.facebook, instagram: row.instagram,
    photoUrl: row.photoMime ? assetUrl(row.id, 'photo', admin) : null,
    curriculumUrl: row.hasCurriculum ? assetUrl(row.id, 'curriculum', admin) : null,
  };
}

export async function listGraduates(): Promise<GraduateProfile[]> {
  const rows = await prisma.graduate.findMany({ where: { status: 'APPROVED' }, select, orderBy: { fullName: 'asc' } });
  return rows.map((row) => toGraduateProfile(row));
}

export async function getGraduate(id: string): Promise<GraduateProfile> {
  const row = await prisma.graduate.findFirst({ where: { id, status: 'APPROVED' }, select });
  if (!row) throw new HttpError(404, 'Egresado no encontrado');
  return toGraduateProfile(row);
}

export async function listApplications(): Promise<GraduateApplication[]> {
  const rows = await prisma.graduate.findMany({ select, orderBy: { createdAt: 'desc' } });
  return rows.map((row) => ({
    ...toGraduateProfile(row, true), email: row.email, showEmail: row.showEmail, status: row.status as GraduateStatus,
    reviewNote: row.reviewNote, reviewedAt: row.reviewedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(), diplomaUrl: assetUrl(row.id, 'diploma', true),
  }));
}

export async function validateGraduateFile(file: Express.Multer.File | undefined, kind: 'diploma' | 'photo' | 'curriculum') {
  if (!file) {
    if (kind === 'diploma') throw new HttpError(400, 'Adjunta tu título para verificar la titulación');
    return null;
  }
  const imageMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowed = kind === 'photo' ? imageMimes : kind === 'curriculum' ? ['application/pdf'] : ['application/pdf', ...imageMimes];
  const detected = await fileTypeFromBuffer(file.buffer);
  if (!detected || !allowed.includes(detected.mime)) {
    throw new HttpError(415, `${kind === 'photo' ? 'La foto' : kind === 'curriculum' ? 'El currículum' : 'El título'} debe ser ${kind === 'curriculum' ? 'PDF' : kind === 'photo' ? 'JPG, PNG o WEBP' : 'PDF, JPG, PNG o WEBP'}`);
  }
  const max = (kind === 'photo' ? 5 : 15) * 1024 * 1024;
  if (file.size > max || file.buffer.byteLength > max) throw new HttpError(413, `El archivo excede ${kind === 'photo' ? 5 : 15} MB`);
  return { bytes: file.buffer, mime: detected.mime };
}

export async function registerGraduate(payload: unknown, files: { [fieldname: string]: Express.Multer.File[] }) {
  const input = graduateRegistrationSchema.parse(payload);
  const [diploma, photo, curriculum] = await Promise.all([
    validateGraduateFile(files.diploma?.[0], 'diploma'),
    validateGraduateFile(files.photo?.[0], 'photo'),
    validateGraduateFile(files.curriculum?.[0], 'curriculum'),
  ]);
  const { consent: _consent, ...profile } = input;
  void _consent;
  // Una sola escritura: no quedan archivos huérfanos si el registro falla.
  await prisma.graduate.create({
    data: {
      ...profile, consentAt: new Date(), status: 'PENDING',
      diploma: diploma!.bytes, diplomaMime: diploma!.mime,
      photo: photo?.bytes, photoMime: photo?.mime,
      curriculum: curriculum?.bytes, hasCurriculum: Boolean(curriculum),
    },
    select: { id: true },
  });
}

export async function reviewGraduate(id: string, userId: string, status: GraduateStatus, reviewNote: string) {
  // La decisión y su auditoría se guardan juntas.
  await prisma.$transaction(async (tx) => {
    const before = await tx.graduate.findUnique({ where: { id }, select: { status: true, reviewNote: true } });
    if (!before) throw new HttpError(404, 'Solicitud no encontrada');
    // Evitar devolver los bytes del título, foto y CV al actualizar el estado.
    await tx.graduate.update({
      where: { id },
      data: { status, reviewNote: reviewNote || null, reviewedBy: userId, reviewedAt: new Date() },
      select: { id: true },
    });
    await tx.auditLog.create({ data: {
      userId, action: 'UPDATE', entityType: 'Graduate', entityId: id,
      before: JSON.stringify(before), after: JSON.stringify({ status, reviewNote }),
    } });
  }, {
    // La conexión remota puede superar el límite predeterminado de 5 segundos.
    timeout: 30_000,
  });
}

export async function updateGraduate(id: string, userId: string, payload: unknown, files: { [fieldname: string]: Express.Multer.File[] }) {
  const { removePhoto, removeCurriculum, ...profile } = graduateEditSchema.parse(payload);
  const [photo, curriculum] = await Promise.all([
    validateGraduateFile(files.photo?.[0], 'photo'),
    validateGraduateFile(files.curriculum?.[0], 'curriculum'),
  ]);
  await prisma.$transaction(async (tx) => {
    const before = await tx.graduate.findUnique({ where: { id }, select });
    if (!before) throw new HttpError(404, 'Egresado no encontrado');
    if (before.status !== 'APPROVED') throw new HttpError(409, 'Solo puedes editar perfiles aprobados');
    const after = await tx.graduate.update({
      where: { id, status: 'APPROVED' },
      data: {
        ...profile,
        ...(photo ? { photo: photo.bytes, photoMime: photo.mime } : removePhoto ? { photo: null, photoMime: null } : {}),
        ...(curriculum ? { curriculum: curriculum.bytes, hasCurriculum: true } : removeCurriculum ? { curriculum: null, hasCurriculum: false } : {}),
      },
      select,
    });
    await tx.auditLog.create({ data: {
      userId, action: 'UPDATE', entityType: 'Graduate', entityId: id,
      before: JSON.stringify(before),
      after: JSON.stringify({ ...after, photoChanged: Boolean(photo) || removePhoto, curriculumChanged: Boolean(curriculum) || removeCurriculum }),
    }, select: { id: true } });
  }, { timeout: 30_000 });
}

export async function getGraduateFile(id: string, kind: string, admin: boolean) {
  if (!['photo', 'curriculum', 'diploma'].includes(kind) || (!admin && kind === 'diploma')) {
    throw new HttpError(404, 'Archivo no encontrado');
  }
  const fileSelect = kind === 'photo' ? { photo: true, photoMime: true } as const
    : kind === 'curriculum' ? { curriculum: true } as const : { diploma: true, diplomaMime: true } as const;
  const row = await prisma.graduate.findFirst({ where: { id, ...(admin ? {} : { status: 'APPROVED' }) }, select: fileSelect });
  if (!row) throw new HttpError(404, 'Archivo no encontrado');
  const bytes = kind === 'photo' ? row.photo : kind === 'curriculum' ? row.curriculum : row.diploma;
  const mime = kind === 'photo' ? row.photoMime : kind === 'curriculum' ? 'application/pdf' : row.diplomaMime;
  if (!bytes || !mime) throw new HttpError(404, 'Archivo no encontrado');
  return { bytes, mime };
}
