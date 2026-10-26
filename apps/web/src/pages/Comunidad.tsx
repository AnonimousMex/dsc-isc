import { useMotionSettings } from '../components/motion/MotionExperience';
import { ArrowUpRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageBanner from '../components/shared/PageBanner';
import { ContentStatus, EditorialIntro } from '../components/shared/Editorial';
import { api, siteConfigValue } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

export default function Comunidad() {
  const { seccion } = useParams<{ seccion?: string }>();
  const { data: sections, loading, error } = useApiData(() => api.communitySections(), []);
  const { data: config } = useApiData(() => api.siteConfig(), []);
  const { enabled } = useMotionSettings();
  const reduced = !enabled;
  const active = seccion ? sections?.find((s) => s.slug === seccion) : sections?.[0];
  return (
    <div className="interior-page community-page">
      <PageBanner
        eyebrow="Comunidad"
        title="Tu talento. Nuestra comunidad."
        imageUrl={
          (config && siteConfigValue<string>(config, 'comunidad.heroImageUrl')) ||
          '/images/comunidad.jpg'
        }
        imageAlt="Fotografía editorial de un equipo colaborando"
      />
      <section className="page-width section-space">
        <EditorialIntro title="Aprender también es conectar.">
          <p>
            Residencias profesionales, investigación y créditos complementarios. Encuentra lo que
            necesitas para seguir avanzando.
          </p>
        </EditorialIntro>
        <ContentStatus
          loading={loading}
          error={error}
          empty={!sections?.length}
          noun="los recursos de la comunidad"
        />
        {!!sections?.length && (
          <div className="community-workspace">
            <nav aria-label="Recursos de la comunidad" className="community-sidebar">
              <p className="section-kicker">ELIGE TU SIGUIENTE PASO</p>
              {sections.map((section) => (
                <Link
                  key={section.id}
                  to={`/comunidad/${section.slug}`}
                  className={active?.id === section.id ? 'selected' : ''}
                  aria-current={active?.id === section.id ? 'page' : undefined}
                >
                  {section.title}
                  <ArrowUpRight size={18} />
                </Link>
              ))}
              <div className="community-aside-image">
                <img
                  src="/images/desarrollo.jpg"
                  alt="Fotografía editorial de herramientas de programación"
                  loading="lazy"
                />
              </div>
            </nav>
            <div className="community-article">
              <AnimatePresence mode="wait">
                {active ? (
                  <motion.article
                    key={active.id}
                    initial={{ opacity: 0, y: reduced ? 0 : 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.25 }}
                  >
                    <p className="section-kicker">COMUNIDAD / SISTEMAS</p>
                    <h2>{active.title}</h2>
                    <div
                      className="prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: active.body }}
                    />
                  </motion.article>
                ) : (
                  <p className="content-status">
                    Este recurso no está disponible. Selecciona otra sección.
                  </p>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
