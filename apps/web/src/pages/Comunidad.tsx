import { lazy } from 'react';
import { Link, useParams } from 'react-router-dom';
import Reveal from '../components/shared/Reveal';
import SectionHero3D from '../components/shared/SectionHero3D';
import { api } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

const CommunityCluster = lazy(() => import('../components/three/CommunityCluster'));

export default function Comunidad() {
  const { seccion } = useParams<{ seccion?: string }>();
  const { data: sections, loading } = useApiData(() => api.communitySections(), []);

  const active = seccion ? (sections ?? []).find((s) => s.slug === seccion) : (sections ?? [])[0];

  return (
    <div>
      <SectionHero3D
        eyebrow="Comunidad"
        title="Comunidad estudiantil"
        description="Residencias profesionales, investigación y créditos complementarios para estudiantes en curso."
        scene={CommunityCluster}
      />

      <div className="mx-auto max-w-4xl px-6 py-20">
        {sections && sections.length > 0 && (
          <Reveal className="flex flex-wrap gap-2 border-b border-line pb-4">
            {sections.map((section) => (
              <Link
                key={section.id}
                to={`/comunidad/${section.slug}`}
                className={`rounded-full border px-4 py-2 text-sm ${
                  active?.slug === section.slug
                    ? 'border-primary bg-primary text-surface'
                    : 'border-line text-muted hover:border-primary hover:text-primary'
                }`}
              >
                {section.title}
              </Link>
            ))}
          </Reveal>
        )}

        <div className="mt-8">
          {!loading && (!sections || sections.length === 0) && (
            <p className="text-sm text-muted">Aún no hay contenido publicado en esta sección.</p>
          )}
          {active && (
            <Reveal key={active.id}>
              <h2 className="text-xl font-bold text-ink">{active.title}</h2>
              {/* Contenido saneado en el servidor (DOMPurify) antes de guardarse. */}
              <div
                className="prose prose-sm mt-4 max-w-none text-muted"
                dangerouslySetInnerHTML={{ __html: active.body }}
              />
            </Reveal>
          )}
        </div>
      </div>
    </div>
  );
}
