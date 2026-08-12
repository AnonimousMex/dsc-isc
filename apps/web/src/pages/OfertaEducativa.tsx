import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import type { TeacherSummary } from '@dsc-isc/shared';
import CircuitBoard from '../components/reticula/CircuitBoard';
import Reveal from '../components/shared/Reveal';
import SectionEyebrow from '../components/shared/SectionEyebrow';
import { api } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

export default function OfertaEducativa() {
  const { programSlug = '' } = useParams<{ programSlug: string }>();
  const { data: program, loading, error } = useApiData(() => api.program(programSlug), [programSlug]);
  const { data: subjects } = useApiData(() => (program ? api.subjects(program.id) : Promise.resolve([])), [
    program?.id,
  ]);
  const { data: teachers } = useApiData(() => api.teachers(), []);

  const teachersById = useMemo(() => {
    const map: Record<string, TeacherSummary> = {};
    for (const teacher of teachers ?? []) map[teacher.id] = teacher;
    return map;
  }, [teachers]);

  if (loading) return null;

  if (error || !program) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center px-6 py-32">
        <SectionEyebrow>Oferta educativa</SectionEyebrow>
        <h1 className="mt-3 text-3xl font-bold text-ink">Programa no disponible todavía</h1>
        <p className="mt-4 text-muted">
          Este programa aún no tiene contenido publicado. Vuelve pronto o consulta la Ingeniería en
          Sistemas Computacionales.
        </p>
      </div>
    );
  }

  const graduateProfile = program.graduateProfile;

  return (
    <div>
      <section className="flex min-h-[60svh] flex-col items-center justify-center bg-deep px-6 py-24 text-center text-surface">
        <Reveal>
          <SectionEyebrow tone="light">Oferta educativa</SectionEyebrow>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold sm:text-5xl">{program.name}</h1>
        </Reveal>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20">
        <Reveal>
          <SectionEyebrow>Video de presentación</SectionEyebrow>
          {program.videoUrl ? (
            <div className="mt-4 aspect-video overflow-hidden rounded-lg bg-elevated">
              <iframe
                src={program.videoUrl}
                title={`Video institucional de ${program.name}`}
                className="h-full w-full"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="mt-4 flex aspect-video items-center justify-center rounded-lg border border-dashed border-line bg-elevated text-sm text-muted">
              Video institucional próximamente
            </div>
          )}
        </Reveal>

        <div className="mt-16 grid gap-10 sm:grid-cols-2">
          <Reveal>
            <h2 className="text-lg font-bold text-ink">Misión</h2>
            <p className="mt-2 text-sm text-muted">{program.mission}</p>
          </Reveal>
          <Reveal delayMs={80}>
            <h2 className="text-lg font-bold text-ink">Visión</h2>
            <p className="mt-2 text-sm text-muted">{program.vision}</p>
          </Reveal>
        </div>

        <Reveal className="mt-16">
          <h2 className="text-lg font-bold text-ink">Metas y objetivos</h2>
          <p className="mt-2 text-sm text-muted">{program.goals}</p>
        </Reveal>

        <Reveal className="mt-16">
          <h2 className="text-lg font-bold text-ink">Perfil de ingreso</h2>
          <p className="mt-2 text-sm text-muted">{program.admissionProfile}</p>
        </Reveal>

        {graduateProfile.length > 0 && (
          <Reveal className="mt-16">
            <h2 className="text-lg font-bold text-ink">Atributos de egreso</h2>
            <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm text-muted marker:font-mono marker:text-signal">
              {graduateProfile.map((attribute) => (
                <li key={attribute}>{attribute}</li>
              ))}
            </ol>
          </Reveal>
        )}

        <Reveal className="mt-16">
          <h2 className="text-lg font-bold text-ink">Campo de acción</h2>
          <p className="mt-2 text-sm text-muted">{program.actionField}</p>
        </Reveal>
      </section>

      <section id="reticula" className="border-t border-line bg-elevated px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionEyebrow>Retícula</SectionEyebrow>
            <h2 className="mt-2 text-2xl font-bold text-ink">Plan de estudios</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Pasa el mouse sobre una materia para ver sus prerrequisitos, o haz click para conocer el
              detalle completo.
            </p>
          </Reveal>
          <Reveal delayMs={100} className="mt-10">
            <CircuitBoard subjects={subjects ?? []} teachersById={teachersById} />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
