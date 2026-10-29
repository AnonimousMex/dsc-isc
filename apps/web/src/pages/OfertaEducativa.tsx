import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Download, ArrowDown, ArrowUpRight, Play } from 'lucide-react';
import { toYoutubeEmbedUrl, type TeacherSummary } from '@dsc-isc/shared';
import ProfileTabs from '../components/oferta/ProfileTabs';
import SystemsExplorer from '../components/oferta/SystemsExplorer';
import CareerLogo from '../components/shared/CareerLogo';
import SemesterReticula from '../components/reticula/SemesterReticula';
import PageBanner from '../components/shared/PageBanner';
import Reveal from '../components/shared/Reveal';
import { ContentStatus } from '../components/shared/Editorial';
import { api, siteConfigValue } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

export default function OfertaEducativa() {
  const { programSlug = '' } = useParams<{ programSlug: string }>();
  const {
    data: program,
    loading,
    error,
  } = useApiData(() => api.program(programSlug), [programSlug]);
  const { data: subjects } = useApiData(
    () => (program ? api.subjects(program.id) : Promise.resolve([])),
    [program?.id],
  );
  const { data: teachers } = useApiData(() => api.teachers(), []);
  const { data: config } = useApiData(() => api.siteConfig(), []);
  const teachersById = useMemo(
    () =>
      Object.fromEntries((teachers ?? []).map((t) => [t.id, t])) as Record<string, TeacherSummary>,
    [teachers],
  );
  if (loading || error || !program)
    return (
      <div className="page-width section-space">
        <ContentStatus
          loading={loading}
          error={error}
          empty={!program}
          noun="el programa académico"
        />
      </div>
    );
  return (
    <div className="interior-page program-page">
      <PageBanner
        eyebrow="La carrera"
        title={program.slug === 'isc' ? 'Ingeniería en Sistemas Computacionales' : program.name}
        imageUrl={
          (config && siteConfigValue<string>(config, 'ofertaEducativa.heroImageUrl')) ||
          '/images/desarrollo.jpg'
        }
        imageAlt="Fotografía editorial de un espacio de desarrollo de software"
      />
      <nav className="program-nav" aria-label="Explora el programa">
        <div className="page-width">
          <a href="#programa">
            El programa <ArrowDown size={14} />
          </a>
          <a href="#perfiles">
            Tu perfil <ArrowDown size={14} />
          </a>
          <a href="#reticula">
            Plan de estudios <ArrowDown size={14} />
          </a>
          <Link to="/especialidades">
            Especialidades <ArrowUpRight size={14} />
          </Link>
        </div>
      </nav>
      <section id="programa" className="page-width section-space">
        <Reveal className="program-opening">
          <div>
            <p className="section-kicker">CONOCE TU CARRERA</p>
            <h2>
              De la primera idea
              <br />a lo que puedes crear.
            </h2>
          </div>
          <div className="program-brand">
            <span className="degree-logo">
              <CareerLogo />
            </span>
            <p>
              INGENIERÍA EN SISTEMAS
              <br />
              COMPUTACIONALES
            </p>
          </div>
        </Reveal>
        {program.videoUrl && (
          <Reveal className="program-video">
            <p className="section-kicker">
              <Play size={14} /> CONOCE EL PROGRAMA
            </p>
            <div className="aspect-video">
              <iframe
                src={toYoutubeEmbedUrl(program.videoUrl)}
                title={`Video institucional de ${program.name}`}
                className="h-full w-full"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Reveal>
        )}
        <Reveal>
          <SystemsExplorer subjects={(subjects ?? []).filter((s) => !s.specialtyId)} />
        </Reveal>
        <Reveal className="program-goals">
          <span className="section-kicker">EL HORIZONTE</span>
          <h2>Metas y objetivos.</h2>
          <p>{program.goals}</p>
        </Reveal>
        <Reveal className="program-profiles">
          <div id="perfiles">
            <p className="section-kicker">TU TRAYECTORIA</p>
            <h2>Descubre tu potencial.</h2>
          </div>
          <ProfileTabs
            admissionProfile={program.admissionProfile}
            graduateProfile={program.graduateProfile}
            actionField={program.actionField}
          />
        </Reveal>
      </section>
      <section id="reticula" className="curriculum-section">
        <div className="page-width">
          <Reveal className="section-heading">
            <div>
              <p className="section-kicker">CONSTRUYE TU CAMINO</p>
              <h2>Plan de estudios.</h2>
            </div>
            <p>
              Explora cada semestre y selecciona una materia
              <br />
              para conocer su carga académica, prerrequisitos y docentes.
            </p>
          </Reveal>
          <Reveal className="mb-8 flex flex-wrap gap-4">
            {program.reticulaPdf && (
              <a
                className="inline-flex items-center gap-2 rounded border border-primary/40 px-5 py-3 text-primary hover:bg-primary/10"
                href={
                  program.reticulaPdf.url ===
                  'https://dsc.itmorelia.edu.mx/web/documentos/reticula_isc.pdf'
                    ? '/documents/isc/reticula-isc.pdf'
                    : program.reticulaPdf.url
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download size={18} /> Descargar retícula PDF
              </a>
            )}
            <Link
              to="/especialidades"
              className="inline-flex items-center gap-2 rounded border border-primary/40 px-5 py-3 text-primary hover:bg-primary/10"
            >
              Ver especialidades <ArrowUpRight size={18} />
            </Link>
          </Reveal>
          <Reveal>
            <SemesterReticula
              subjects={(subjects ?? []).filter((s) => !s.specialtyId)}
              teachersById={teachersById}
            />
          </Reveal>
        </div>
      </section>
      <section className="page-width section-space">
        <Reveal className="program-goals">
          <p className="section-kicker">CONTINÚA TU FORMACIÓN</p>
          <h2>Maestría en Sistemas Computacionales.</h2>
          <p>
            Conoce el programa de posgrado, sus líneas de investigación y el proceso de admisión.
          </p>
          <a
            className="mt-6 inline-flex items-center gap-2 text-primary hover:underline"
            href="https://mscitmorelia.com.mx/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Explorar la maestría <ArrowUpRight size={18} />
          </a>
        </Reveal>
      </section>
    </div>
  );
}
