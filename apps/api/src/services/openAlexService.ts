import type { OpenAlexAuthorCandidate, TeacherArticle } from '@dsc-isc/shared';
import { env } from '../lib/env.js';

const BASE_URL = 'https://api.openalex.org';

// Cuántas publicaciones recientes se muestran por docente — alcanza para
// una sección "Publicaciones recientes", no se busca reconstruir todo el
// historial bibliométrico (eso es lo que hace el notebook de la práctica).
const ARTICLES_PER_AUTHOR = 25;

// OpenAlex se actualiza constantemente, pero golpearla en cada vista de
// página sería lento y abusivo. Un caché corto en memoria mantiene la
// sección "casi en tiempo real" (se refleja un artículo nuevo dentro de
// esta ventana) sin pegarle a la API en cada request.
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

interface CacheEntry {
  fetchedAt: number;
  articles: TeacherArticle[];
}

const articlesCache = new Map<string, CacheEntry>();

function withMailto(params: Record<string, string>): Record<string, string> {
  if (env.openAlexMailto) return { ...params, mailto: env.openAlexMailto };
  return params;
}

function mapWork(work: Record<string, unknown>): TeacherArticle {
  const id = String(work.id ?? '').split('/').pop() ?? '';
  const primaryLocation = (work.primary_location ?? {}) as Record<string, unknown>;
  const source = (primaryLocation.source ?? {}) as Record<string, unknown>;
  const openAccess = (work.open_access ?? {}) as Record<string, unknown>;
  const doi = typeof work.doi === 'string' ? work.doi : null;

  return {
    id,
    title: String(work.display_name ?? 'Sin título'),
    year: typeof work.publication_year === 'number' ? work.publication_year : null,
    type: String(work.type ?? 'work'),
    venue: typeof source.display_name === 'string' ? source.display_name : null,
    doi,
    url: doi ?? String(work.id ?? ''),
    citedByCount: typeof work.cited_by_count === 'number' ? work.cited_by_count : 0,
    isOpenAccess: Boolean(openAccess.is_oa),
  };
}

/**
 * Trae las publicaciones más recientes de un autor de OpenAlex. Nunca
 * lanza por errores de red/API — si OpenAlex falla, se degrada a lista
 * vacía (o al último resultado en caché, si lo hay) en vez de romper la
 * página del docente.
 */
export async function fetchArticlesForAuthor(openAlexId: string): Promise<TeacherArticle[]> {
  const cached = articlesCache.get(openAlexId);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.articles;
  }

  try {
    const params = new URLSearchParams(
      withMailto({
        filter: `author.id:${openAlexId}`,
        sort: 'publication_date:desc',
        'per-page': String(ARTICLES_PER_AUTHOR),
      }),
    );
    const response = await fetch(`${BASE_URL}/works?${params.toString()}`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`OpenAlex respondió ${response.status}`);

    const data = (await response.json()) as { results?: Array<Record<string, unknown>> };
    const articles = (data.results ?? []).map(mapWork);
    articlesCache.set(openAlexId, { fetchedAt: Date.now(), articles });
    return articles;
  } catch (error) {
    console.error(`[openAlex] no se pudieron obtener artículos de ${openAlexId}:`, error);
    return cached?.articles ?? [];
  }
}

/**
 * Busca autores por nombre para que, desde el admin, se elija a mano al
 * investigador correcto (ver notebook de referencia: el nombre por sí solo
 * no identifica de forma única a una persona).
 */
export async function searchAuthors(query: string): Promise<OpenAlexAuthorCandidate[]> {
  const params = new URLSearchParams(withMailto({ search: query, 'per-page': '8' }));
  const response = await fetch(`${BASE_URL}/authors?${params.toString()}`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`OpenAlex respondió ${response.status}`);

  const data = (await response.json()) as { results?: Array<Record<string, unknown>> };
  return (data.results ?? []).map((author) => {
    const institutions = (author.last_known_institutions ?? []) as Array<Record<string, unknown>>;
    const institutionName = institutions[0]?.display_name;
    return {
      openAlexId: String(author.id ?? '').split('/').pop() ?? '',
      name: String(author.display_name ?? ''),
      institution: typeof institutionName === 'string' ? institutionName : null,
      orcid: typeof author.orcid === 'string' ? author.orcid : null,
      worksCount: typeof author.works_count === 'number' ? author.works_count : 0,
      citedByCount: typeof author.cited_by_count === 'number' ? author.cited_by_count : 0,
    };
  });
}
