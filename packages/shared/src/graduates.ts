import { z } from 'zod';

const publicLink = z.string().trim().max(500).refine((value) => {
  if (!value) return true;
  try { return ['https:', 'http:'].includes(new URL(value).protocol); }
  catch { return false; }
}, 'Usa un enlace válido con https:// o http://').default('');

export const graduateRegistrationSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  graduationYear: z.number().int().min(1950).refine((year) => year <= new Date().getFullYear(), 'El año de titulación no puede ser futuro'),
  headline: z.string().trim().min(2).max(160),
  bio: z.string().trim().min(20, 'Cuéntanos sobre ti en al menos 20 caracteres').max(4000),
  experience: z.string().trim().max(6000),
  city: z.string().trim().max(160),
  website: publicLink,
  linkedin: publicLink,
  github: publicLink,
  facebook: publicLink,
  instagram: publicLink,
  showEmail: z.boolean().default(false),
  consent: z.literal(true, { errorMap: () => ({ message: 'Debes autorizar la publicación de tu perfil' }) }),
});

export const graduateEditSchema = graduateRegistrationSchema.omit({ consent: true }).extend({
  removePhoto: z.boolean().default(false),
  removeCurriculum: z.boolean().default(false),
});

export const graduateReviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'PENDING']),
  reviewNote: z.string().trim().max(2000).default(''),
  titleVerified: z.boolean().default(false),
}).refine((value) => value.status !== 'REJECTED' || value.reviewNote.length > 0, {
  message: 'Indica el motivo del rechazo', path: ['reviewNote'],
}).refine((value) => value.status !== 'APPROVED' || value.titleVerified, {
  message: 'Confirma que verificaste el título profesional', path: ['titleVerified'],
});

export type GraduateRegistrationInput = z.infer<typeof graduateRegistrationSchema>;
export type GraduateStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export interface GraduateProfile {
  id: string;
  fullName: string;
  headline: string;
  graduationYear: number;
  bio: string;
  experience: string;
  city: string;
  email: string | null;
  website: string | null;
  linkedin: string | null;
  github: string | null;
  facebook: string | null;
  instagram: string | null;
  photoUrl: string | null;
  curriculumUrl: string | null;
}
export interface GraduateApplication extends GraduateProfile {
  showEmail: boolean;
  email: string;
  status: GraduateStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  diplomaUrl: string;
}
