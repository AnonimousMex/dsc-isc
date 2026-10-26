import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import NewsCard from '../components/noticias/NewsCard';
import PageBanner from '../components/shared/PageBanner';
import Reveal from '../components/shared/Reveal';
import { ContentStatus, EditorialIntro } from '../components/shared/Editorial';
import { api, siteConfigValue } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

export default function Noticias() {
  const { data: news, loading, error } = useApiData(() => api.news(), []);
  const { data: config } = useApiData(() => api.siteConfig(), []);
  const [query, setQuery] = useState('');
  const filtered = (news ?? []).filter((item) =>
    `${item.title} ${item.excerpt}`.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es')),
  );
  const featured = !query ? filtered[0] : null;
  return (
    <div className="interior-page news-page">
      <PageBanner
        sculpture="news"
        eyebrow="Noticias"
        title="Sistemas en movimiento."
        imageUrl={
          (config && siteConfigValue<string>(config, 'noticias.heroImageUrl')) ||
          '/images/comunidad.jpg'
        }
        imageAlt="Fotografía editorial de colaboración en equipo"
      />
      <section className="page-width section-space">
        <EditorialIntro title="Lo que pasa. Lo que viene.">
          <p>Historias, actividades y novedades de nuestra comunidad.</p>
        </EditorialIntro>
        <div className="editorial-toolbar">
          <p className="section-kicker">ACTUALIDAD / ISC</p>
          <input
            type="search"
            aria-label="Buscar noticias"
            placeholder="Encuentra una historia…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <ContentStatus loading={loading} error={error} empty={!news?.length} noun="las noticias" />
        {featured && (
          <Reveal>
            <Link to={`/noticias/${featured.slug}`} className="featured-news">
              <div className="featured-news-image">
                <img
                  src={featured.coverImage?.url ?? '/images/desarrollo.jpg'}
                  alt={
                    featured.coverImage?.alt ??
                    (featured.coverImage ? featured.title : 'Fotografía editorial de programación')
                  }
                  loading="lazy"
                />
              </div>
              <div>
                <p className="section-kicker">
                  EN PORTADA
                  {featured.publishedAt
                    ? ` / ${new Date(featured.publishedAt).toLocaleDateString('es-MX')}`
                    : ''}
                </p>
                <h2>{featured.title}</h2>
                <p>{featured.excerpt}</p>
                <span className="text-link">
                  Leer la historia <ArrowUpRight size={20} />
                </span>
              </div>
            </Link>
          </Reveal>
        )}
        {!loading && !error && !!news?.length && !filtered.length && (
          <p className="content-status">No hay noticias que coincidan con tu búsqueda.</p>
        )}
        <div className="news-grid">
          {(featured ? filtered.slice(1) : filtered).map((item, i) => (
            <Reveal key={item.id} delayMs={(i % 3) * 70}>
              <NewsCard news={item} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
