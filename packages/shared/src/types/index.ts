/**
 * Tipos de lectura compartidos entre api, web y admin.
 * Reflejan la forma que la API expone en sus respuestas JSON (después de
 * parsear los campos que en SQLite viven como texto serializado, ver
 * apps/api/prisma/schema.prisma).
 */

export type Role = 'SUPERADMIN' | 'EDITOR' | 'VIEWER';
export type MediaKind = 'IMAGE' | 'VIDEO' | 'DOCUMENT';
export type SourceType = 'LOCAL' | 'EXTERNAL';

export interface MediaAsset {
  id: string;
  kind: MediaKind;
  sourceType: SourceType;
  path: string;
  url: string;
  alt: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  has2fa: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  before: unknown;
  after: unknown;
  createdAt: string;
}

export interface SiteConfig {
  key: string;
  value: unknown;
  updatedAt: string;
}

export interface HeroSlide {
  id: string;
  order: number;
  media: MediaAsset;
  captionCode: string;
  isActive: boolean;
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
}

export interface Program {
  id: string;
  slug: string;
  name: string;
  mission: string;
  vision: string;
  goals: string;
  admissionProfile: string;
  graduateProfile: string[];
  actionField: string;
  videoUrl: string | null;
  reticulaImage: MediaAsset | null;
  reticulaPdf: MediaAsset | null;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  semester: number;
  objective: string;
  programId: string;
  teacherIds: string[];
  prerequisiteIds: string[];
}

export interface TeacherSummary {
  id: string;
  slug: string;
  fullName: string;
  title: string;
  photo: MediaAsset | null;
  isActive: boolean;
}

export interface Teacher extends TeacherSummary {
  bio: string;
  experience: string;
  youtubeUrl: string | null;
  email: string | null;
  website: string | null;
  linkedin: string | null;
  facebook: string | null;
  twitter: string | null;
  subjectIds: string[];
}

export interface EquipmentItem {
  label: string;
  value: string;
}

export interface Lab {
  id: string;
  slug: string;
  name: string;
  description: string;
  equipment: EquipmentItem[];
  relatedSubjects: string[];
  gallery: MediaAsset[];
}

export interface Specialty {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: MediaAsset | null;
}

export interface DscDocument {
  id: string;
  title: string;
  category: string;
  media: MediaAsset;
  updatedAt: string;
}

export interface News {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: MediaAsset | null;
  publishedAt: string | null;
  isPublished: boolean;
}

export interface CommunitySection {
  id: string;
  slug: string;
  title: string;
  body: string;
  documentIds: string[];
}
