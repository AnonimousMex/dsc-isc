import { lazy } from 'react';
import NewsCard from '../components/noticias/NewsCard';
import Reveal from '../components/shared/Reveal';
import SectionHero3D from '../components/shared/SectionHero3D';
import { api } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

const BroadcastWaves = lazy(() => import('../components/three/BroadcastWaves'));

export default function Noticias() {
  const { data: news, loading } = useApiData(() => api.news(), []);

  return (
    <div>
      <SectionHero3D eyebrow="Comunidad" title="Noticias" scene={BroadcastWaves} />

      <div className="mx-auto max-w-6xl px-6 py-20">
        {!loading && news && news.length === 0 && (
          <p className="text-sm text-muted">Aún no hay noticias publicadas.</p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(news ?? []).map((item, i) => (
            <Reveal key={item.id} delayMs={(i % 3) * 80}>
              <NewsCard news={item} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
