import { useParams } from 'react-router-dom';
import Reveal from '../components/shared/Reveal';
import SectionEyebrow from '../components/shared/SectionEyebrow';
import { api } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

export default function NoticiaDetalle() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: news, loading, error } = useApiData(() => api.newsItem(slug), [slug]);

  if (loading) return null;

  if (error || !news) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center px-6 py-32">
        <SectionEyebrow>Noticias</SectionEyebrow>
        <h1 className="mt-3 text-3xl font-bold text-ink">Noticia no encontrada</h1>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-24">
      <Reveal>
        <SectionEyebrow>Noticias</SectionEyebrow>
        <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">{news.title}</h1>
        {news.publishedAt && (
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-muted">
            {new Date(news.publishedAt).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
      </Reveal>

      {news.coverImage && (
        <Reveal delayMs={80}>
          <img
            src={news.coverImage.url}
            alt={news.coverImage.alt ?? news.title}
            className="mt-8 aspect-video w-full rounded-lg object-cover"
          />
        </Reveal>
      )}

      {/* Contenido saneado en el servidor (DOMPurify) antes de guardarse. */}
      <Reveal delayMs={120}>
        <div
          className="prose prose-sm mt-8 max-w-none text-muted"
          dangerouslySetInnerHTML={{ __html: news.body }}
        />
      </Reveal>
    </article>
  );
}
