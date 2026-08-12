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
  TeacherSummary,
  TimelineEvent,
} from '@dsc-isc/shared';

const API_URL = import.meta.env.VITE_API_URL;

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
  heroSlides: () => get<HeroSlide[]>('/hero-slides'),
  siteConfig: () => get<SiteConfig[]>('/site-config'),
  timeline: () => get<TimelineEvent[]>('/timeline'),
  programs: () => get<Program[]>('/programs'),
  program: (slug: string) => get<Program>(`/programs/${slug}`),
  subjects: (programId?: string) => get<Subject[]>(programId ? `/subjects?programId=${programId}` : '/subjects'),
  teachers: () => get<TeacherSummary[]>('/teachers'),
  teacher: (slug: string) => get<Teacher>(`/teachers/${slug}`),
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
