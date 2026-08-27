import { z } from 'zod';

/**
 * Esquemas Zod para los payloads de escritura (create/update) de cada
 * entidad. Se usan tanto en el cliente (admin) para validar formularios
 * antes de enviar, como en el servidor (api) para rechazar cualquier
 * payload que no los cumpla — la validación real y no confiable siempre
 * vive en la API (ver README, sección de seguridad).
 */

export const urlSchema = z.string().url('Debe ser una URL válida');

const TRUSTED_EMBED_HOSTS = new Set([
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'youtube-nocookie.com',
]);

/**
 * Los videos institucionales/de docentes se embeben en un <iframe> en el
 * sitio público. Sin restringir el host, una cuenta EDITOR (de menor
 * confianza que SUPERADMIN) podría pegar cualquier URL y quedar embebida
 * en una página del departamento — un vector de phishing/clickjacking. Se
 * exige que sea un embed real de YouTube (sección 9: nunca confiar en la
 * entrada, aunque venga de un admin autenticado).
 */
export const youtubeEmbedUrlSchema = urlSchema.refine(
  (value) => {
    try {
      return TRUSTED_EMBED_HOSTS.has(new URL(value).hostname);
    } catch {
      return false;
    }
  },
  { message: 'Debe ser una URL de youtube.com o youtube-nocookie.com' },
);

/**
 * El flujo de medios es siempre en dos pasos: primero se registra el
 * archivo (subiéndolo con `POST /api/media/upload` o registrando un enlace
 * externo con `POST /api/media/external`), lo que devuelve un `MediaAsset`
 * con su `id`; después, cualquier entidad (docente, laboratorio, noticia...)
 * solo referencia ese `mediaId`. Así el componente `ImageUploader.tsx` del
 * admin (pestañas "Subir archivo" / "Usar enlace") es independiente del
 * formulario de la entidad que lo usa.
 */
export const externalMediaSchema = z.object({
  url: urlSchema,
  kind: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT']),
  alt: z.string().max(300).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  totpCode: z.string().length(6).optional(),
});

export const totpConfirmSchema = z.object({
  setupToken: z.string().min(1),
  code: z.string().length(6),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12, 'Mínimo 12 caracteres'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(12, 'Mínimo 12 caracteres'),
});

export const userCreateSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(12, 'Mínimo 12 caracteres'),
  role: z.enum(['SUPERADMIN', 'EDITOR', 'VIEWER']),
});

export const userUpdateSchema = userCreateSchema
  .partial({ password: true })
  .extend({ isActive: z.boolean().optional() });

export const teacherSchema = z.object({
  fullName: z.string().min(2).max(160),
  title: z.string().min(2).max(160),
  bio: z.string().max(4000),
  experience: z.string().max(4000),
  photoId: z.string().nullable().optional(),
  youtubeUrl: youtubeEmbedUrlSchema.nullable().optional().or(z.literal('')),
  email: z.string().email().nullable().optional().or(z.literal('')),
  website: urlSchema.nullable().optional().or(z.literal('')),
  linkedin: urlSchema.nullable().optional().or(z.literal('')),
  facebook: urlSchema.nullable().optional().or(z.literal('')),
  twitter: urlSchema.nullable().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  subjectIds: z.array(z.string()).default([]),
});

export const subjectSchema = z.object({
  code: z.string().min(2).max(20),
  name: z.string().min(2).max(160),
  semester: z.number().int().min(1).max(20),
  objective: z.string().max(2000),
  programId: z.string().min(1),
  prerequisiteIds: z.array(z.string()).default([]),
});

export const equipmentItemSchema = z.object({
  label: z.string().min(1).max(60),
  value: z.string().min(1).max(160),
});

export const labSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  name: z.string().min(2).max(160),
  description: z.string().max(4000),
  equipment: z.array(equipmentItemSchema).default([]),
  relatedSubjects: z.array(z.string()).default([]),
  galleryMediaIds: z.array(z.string()).default([]),
});

export const specialtySchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(160),
  description: z.string().max(4000),
  imageId: z.string().nullable().optional(),
});

export const documentSchema = z.object({
  title: z.string().min(2).max(200),
  category: z.enum(['Reglamento', 'Formato', 'Normativa']),
  mediaId: z.string().min(1),
});

export const newsSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  title: z.string().min(2).max(200),
  excerpt: z.string().max(400),
  body: z.string().max(50_000),
  coverImageId: z.string().nullable().optional(),
  isPublished: z.boolean().default(false),
});

export const communitySectionSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  title: z.string().min(2).max(200),
  body: z.string().max(50_000),
  documentIds: z.array(z.string()).default([]),
});

export const programSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(160),
  mission: z.string().max(4000),
  vision: z.string().max(4000),
  goals: z.string().max(4000),
  admissionProfile: z.string().max(4000),
  graduateProfile: z.array(z.string().min(1)).default([]),
  actionField: z.string().max(4000),
  videoUrl: youtubeEmbedUrlSchema.nullable().optional().or(z.literal('')),
  reticulaImageId: z.string().nullable().optional(),
  reticulaPdfId: z.string().nullable().optional(),
});

export const heroSlideSchema = z.object({
  order: z.number().int().min(0),
  mediaId: z.string().min(1),
  captionCode: z.string().min(1).max(120),
  isActive: z.boolean().default(true),
});

export const timelineEventSchema = z.object({
  year: z.string().min(1).max(20),
  title: z.string().min(1).max(160),
  description: z.string().max(2000),
  order: z.number().int().min(0),
  isActive: z.boolean().default(true),
});

export const siteConfigSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type TeacherInput = z.infer<typeof teacherSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;
export type LabInput = z.infer<typeof labSchema>;
export type SpecialtyInput = z.infer<typeof specialtySchema>;
export type DocumentInput = z.infer<typeof documentSchema>;
export type NewsInput = z.infer<typeof newsSchema>;
export type CommunitySectionInput = z.infer<typeof communitySectionSchema>;
export type ProgramInput = z.infer<typeof programSchema>;
export type HeroSlideInput = z.infer<typeof heroSlideSchema>;
export type TimelineEventInput = z.infer<typeof timelineEventSchema>;
export type ExternalMediaInput = z.infer<typeof externalMediaSchema>;
