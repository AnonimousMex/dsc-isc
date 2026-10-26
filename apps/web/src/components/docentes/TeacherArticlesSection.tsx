import ArticleCard from './ArticleCard';
import Reveal from '../shared/Reveal';
import { api } from '../../lib/apiClient';
import { useApiData } from '../../lib/useApiData';

interface TeacherArticlesSectionProps {
  slug: string;
  hasOpenAlexLink: boolean;
}

/**
 * Publicaciones recuperadas en vivo desde OpenAlex (ver apps/api
 * openAlexService). No se renderiza nada si el docente no está enlazado a
 * un autor de OpenAlex — evita una sección vacía en la mayoría de los
 * perfiles mientras se van enlazando desde el admin.
 */
export default function TeacherArticlesSection({ slug, hasOpenAlexLink }: TeacherArticlesSectionProps) {
  const { data: articles, loading } = useApiData(
    () => (hasOpenAlexLink ? api.teacherArticles(slug) : Promise.resolve([])),
    [slug, hasOpenAlexLink],
  );

  if (!hasOpenAlexLink || loading || !articles || articles.length === 0) return null;

  return (
    <Reveal delayMs={200} className="mt-12">
      <h2 className="text-lg font-bold text-ink">Publicaciones recientes</h2>
      <div className="mt-4 flex flex-col gap-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </Reveal>
  );
}
