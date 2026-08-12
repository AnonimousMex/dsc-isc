import NewsCard from '../components/noticias/NewsCard';
import Reveal from '../components/shared/Reveal';
import SectionEyebrow from '../components/shared/SectionEyebrow';
import { api } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

export default function Noticias() {
  const { data: news, loading } = useApiData(() => api.news(), []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <SectionEyebrow>Comunidad</SectionEyebrow>
        <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Noticias</h1>
      </Reveal>

      {!loading && news && news.length === 0 && (
        <p className="mt-10 text-sm text-muted">Aún no hay noticias publicadas.</p>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(news ?? []).map((item, i) => (
          <Reveal key={item.id} delayMs={(i % 3) * 80}>
            <NewsCard news={item} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
