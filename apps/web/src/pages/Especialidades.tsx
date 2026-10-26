import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import PageBanner from '../components/shared/PageBanner';
import Reveal from '../components/shared/Reveal';
import { ContentStatus, EditorialIntro } from '../components/shared/Editorial';
import { api, siteConfigValue } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

export default function Especialidades() {
  const { data: specialties, loading, error } = useApiData(() => api.specialties(), []);
  const { data: config } = useApiData(() => api.siteConfig(), []);
  return (
    <div className="interior-page specialties-page">
      <PageBanner
        sculpture="specialties"
        eyebrow="Especialidades"
        title="Dale dirección a tu talento."
        imageUrl={
          (config && siteConfigValue<string>(config, 'especialidades.heroImageUrl')) ||
          '/images/tecnologia.jpg'
        }
        imageAlt="Fotografía editorial de tecnología electrónica"
      />
      <section className="page-width section-space">
        <EditorialIntro title="Encuentra tu siguiente enfoque.">
          <p>
            Explora las áreas de especialidad de Ingeniería en Sistemas Computacionales y conoce el
            contenido de cada una.
          </p>
        </EditorialIntro>
        <ContentStatus
          loading={loading}
          error={error}
          empty={!specialties?.length}
          noun="las especialidades"
        />
        <div className="specialty-list">
          {specialties?.map((item, i) => (
            <Reveal key={item.id} delayMs={(i % 3) * 70}>
              <Link to={`/especialidades/${item.slug}`} className="specialty-editorial">
                <div className="specialty-image">
                  <img
                    src={
                      item.image?.url ??
                      ['/images/tecnologia.jpg', '/images/desarrollo.jpg', '/images/comunidad.jpg'][
                        i % 3
                      ]
                    }
                    alt={
                      item.image?.alt ??
                      (item.image ? item.name : 'Fotografía editorial de tecnología y colaboración')
                    }
                    loading="lazy"
                  />
                </div>
                <div>
                  <p className="section-kicker">ESPECIALIDAD / ISC</p>
                  <h2>{item.name}</h2>
                  <p>{item.description}</p>
                  <span className="text-link">
                    Conoce la especialidad <ArrowUpRight size={20} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
