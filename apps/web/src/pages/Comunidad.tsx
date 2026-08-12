import { Link, useParams } from 'react-router-dom';
import Reveal from '../components/shared/Reveal';
import SectionEyebrow from '../components/shared/SectionEyebrow';
import { api } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

export default function Comunidad() {
  const { seccion } = useParams<{ seccion?: string }>();
  const { data: sections, loading } = useApiData(() => api.communitySections(), []);

  const active = seccion ? (sections ?? []).find((s) => s.slug === seccion) : (sections ?? [])[0];

  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <Reveal>
        <SectionEyebrow>Comunidad</SectionEyebrow>
        <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Comunidad estudiantil</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Residencias profesionales, investigación y créditos complementarios para estudiantes en curso.
        </p>
      </Reveal>

      {sections && sections.length > 0 && (
        <Reveal delayMs={80} className="mt-10 flex flex-wrap gap-2 border-b border-line pb-4">
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
  );
}
