import { Link, useParams } from 'react-router-dom';
import { resizeImageUrl } from '@dsc-isc/shared';
import Reveal from '../components/shared/Reveal';
import SectionEyebrow from '../components/shared/SectionEyebrow';
import { api } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';
import SemesterReticula from '../components/reticula/SemesterReticula';
import { ContentStatus } from '../components/shared/Editorial';

export default function EspecialidadDetalle() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: specialty, loading, error } = useApiData(() => api.specialty(slug), [slug]);
  const {
    data: subjects,
    loading: subjectsLoading,
    error: subjectsError,
  } = useApiData(
    () => (specialty ? api.specialtySubjects(specialty.id) : Promise.resolve([])),
    [specialty?.id],
  );
  const { data: teachers } = useApiData(() => api.teachers(), []);
  const teachersById = Object.fromEntries((teachers ?? []).map((t) => [t.id, t]));

  if (loading) return null;

  if (error || !specialty) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center px-6 py-32">
        <SectionEyebrow>Especialidades</SectionEyebrow>
        <h1 className="mt-3 text-3xl font-bold text-ink">Especialidad no encontrada</h1>
      </div>
    );
  }

  return (
    <div className="interior-page specialty-detail-page">
      <div className="detail-editorial page-width">
        <Link to="/especialidades" className="text-sm text-accent underline">
          ← Retículas y especialidades
        </Link>
        <Reveal className="mt-4">
          <SectionEyebrow>Especialidades</SectionEyebrow>
          <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">{specialty.name}</h1>
        </Reveal>

        {specialty.image && (
          <Reveal delayMs={80}>
            <img
              src={resizeImageUrl(specialty.image.url, 900)}
              alt={specialty.image.alt ?? specialty.name}
              className="mt-8 aspect-video w-full rounded-lg object-cover"
              loading="lazy"
            />
          </Reveal>
        )}

        <Reveal delayMs={120}>
          <p className="mt-8 whitespace-pre-line text-muted">{specialty.description}</p>
        </Reveal>
      </div>
      <section id="reticula" className="curriculum-section">
        <div className="page-width">
          <Reveal className="section-heading">
            <div>
              <p className="section-kicker">CONSTRUYE TU CAMINO</p>
              <h2>Plan de estudios.</h2>
            </div>
            <p>
              Explora cada semestre y selecciona una materia para consultar su plan de estudios,
              carga académica y docentes. Las materias optativas se indican en cada ficha.
            </p>
          </Reveal>
          {(specialty.reticulaPdf || specialty.reticulaUrl) && (
            <a
              className="mb-8 inline-flex rounded border border-primary/40 px-5 py-3 text-primary hover:bg-primary/10"
              href={specialty.reticulaPdf?.url || specialty.reticulaUrl!}
              target="_blank"
              rel="noopener noreferrer"
            >
              Consultar retícula oficial ↗
            </a>
          )}
          <ContentStatus
            loading={subjectsLoading}
            error={subjectsError}
            empty={false}
            noun="las materias de la especialidad"
          />
          {!subjectsLoading && !subjectsError && (
            <SemesterReticula
              key={specialty.id}
              subjects={subjects ?? []}
              teachersById={teachersById}
            />
          )}
        </div>
      </section>
    </div>
  );
}
