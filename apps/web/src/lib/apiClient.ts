import type {
  CommunitySection,
  DscDocument,
  HeroSlide,
  Lab,
  News,
  Program,
  SiteConfig,
  Specialty,
  Subject,
  Teacher,
  TeacherArticle,
  TeacherSummary,
  TimelineEvent,
} from '@dsc-isc/shared';

const API_URL = import.meta.env.VITE_API_URL;

export async function registerGraduate(form: FormData): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/api/graduates/register`, { method: 'POST', body: form });
  const body = await res.json();
  if (!res.ok) {
    const fieldErrors = body.details?.fieldErrors as Record<string, string[]> | undefined;
    const detail = fieldErrors ? Object.values(fieldErrors).flat()[0] : undefined;
    throw new Error(res.status === 409 ? 'Ya existe una solicitud con ese correo. Contacta al departamento para actualizarla.' : detail ?? body.error ?? 'No se pudo enviar la solicitud');
  }
  return body;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`);
  if (!res.ok) {
    throw new Error(`Error ${res.status} al consultar ${path}`);
  }
  return res.json() as Promise<T>;
}

/**
 * El sitio público (apps/web) es de solo lectura contra la API — nunca
 * muta datos, así que este cliente no necesita manejar CSRF ni cookies de
 * sesión (eso vive en el cliente de apps/admin).
 */
export const api = {
  graduates: () => get<import('@dsc-isc/shared').GraduateProfile[]>('/graduates'),
  graduate: (id: string) => get<import('@dsc-isc/shared').GraduateProfile>(`/graduates/${encodeURIComponent(id)}`),
  heroSlides: () => get<HeroSlide[]>('/hero-slides'),
  siteConfig: () => get<SiteConfig[]>('/site-config'),
  timeline: () => get<TimelineEvent[]>('/timeline'),
  programs: () => get<Program[]>('/programs'),
  program: (slug: string) => get<Program>(`/programs/${slug}`),
  subjects: (programId?: string) => get<Subject[]>(programId ? `/subjects?programId=${programId}` : '/subjects'),
  teachers: () => get<TeacherSummary[]>('/teachers'),
  teacher: (slug: string) => get<Teacher>(`/teachers/${slug}`),
  teacherArticles: (slug: string) => get<TeacherArticle[]>(`/teachers/${slug}/articles`),
  labs: () => get<Lab[]>('/labs'),
  lab: (slug: string) => get<Lab>(`/labs/${slug}`),
  specialties: () => get<Specialty[]>('/specialties'),
  specialty: (slug: string) => get<Specialty>(`/specialties/${slug}`),
  documents: (params?: { category?: string; q?: string }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.q) qs.set('q', params.q);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return get<DscDocument[]>(`/documents${suffix}`);
  },
  news: () => get<News[]>('/news'),
  newsItem: (slug: string) => get<News>(`/news/${slug}`),
  communitySections: () => get<CommunitySection[]>('/community-sections'),
  communitySection: (slug: string) => get<CommunitySection>(`/community-sections/${slug}`),
};

export function siteConfigValue<T>(config: SiteConfig[], key: string): T | undefined {
  return config.find((entry) => entry.key === key)?.value as T | undefined;
}
