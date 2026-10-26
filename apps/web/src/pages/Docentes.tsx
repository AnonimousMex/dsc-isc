import { EditorialIntro } from '../components/shared/Editorial';
import { useState } from 'react';
import { TEACHER_SPECIALTIES } from '@dsc-isc/shared';
import TeacherCard from '../components/docentes/TeacherCard';
import TeacherModal from '../components/docentes/TeacherModal';
import PageBanner from '../components/shared/PageBanner';
import Reveal from '../components/shared/Reveal';
import { api, siteConfigValue } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

export default function Docentes() {
  const { data: teachers, loading } = useApiData(() => api.teachers(), []);
  const { data: config } = useApiData(() => api.siteConfig(), []);
  const heroImageUrl = config
    ? siteConfigValue<string>(config, 'docentes.heroImageUrl')
    : undefined;

  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const { data: selectedTeacher } = useApiData(
    () => (selectedSlug ? api.teacher(selectedSlug) : Promise.resolve(null)),
    [selectedSlug],
  );
  const { data: allSubjects } = useApiData(() => api.subjects(), []);

  const filtered = (teachers ?? []).filter((teacher) => {
    const matchesQuery = `${teacher.fullName} ${teacher.title}`
      .toLocaleLowerCase('es')
      .includes(query.toLocaleLowerCase('es'));
    const matchesSpecialty = !specialty || teacher.specialty === specialty;
    return matchesQuery && matchesSpecialty;
  });

  const selectedSubjects = selectedTeacher
    ? (allSubjects ?? []).filter((s) => selectedTeacher.subjectIds.includes(s.id))
    : [];

  return (
    <div className="interior-page faculty-page">
      <PageBanner
        sculpture="faculty"
        eyebrow="Docentes"
        title="El conocimiento tiene rostro."
        imageUrl={heroImageUrl ?? '/images/comunidad.jpg'}
        imageAlt="Fotografía editorial de colaboración y aprendizaje"
      />

      <div className="page-width section-space">
        <EditorialIntro title="Conoce a quienes te acompañan.">
          <p>
            Explora las áreas de especialidad de nuestros docentes y descubre su experiencia, las
            materias que imparten y sus formas de contacto.
          </p>
        </EditorialIntro>

        <div className="faculty-toolbar">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar docente por nombre…"
            aria-label="Buscar docente"
            className="w-full rounded-md border border-line bg-surface px-4 py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal sm:max-w-xs"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={specialty === null}
              onClick={() => setSpecialty(null)}
              className={specialty === null ? 'pill-gold-active' : 'pill-gold'}
            >
              Todas
            </button>
            {TEACHER_SPECIALTIES.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={specialty === s}
                onClick={() => setSpecialty(s)}
                className={specialty === s ? 'pill-gold-active' : 'pill-gold'}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <p className="result-count" role="status">
          {loading
            ? 'CARGANDO DIRECTORIO…'
            : `${filtered.length} DOCENTES / ${specialty ?? 'TODAS LAS ÁREAS'}`}
        </p>
        {!loading && filtered.length === 0 && (
          <p className="mt-10 text-sm text-muted">No hay docentes que coincidan con la búsqueda.</p>
        )}

        <div className="faculty-grid">
          {filtered.map((teacher, i) => (
            <Reveal key={teacher.id} delayMs={(i % 8) * 40}>
              <TeacherCard teacher={teacher} onOpenDetail={setSelectedSlug} />
            </Reveal>
          ))}
        </div>
      </div>

      {selectedTeacher && (
        <TeacherModal
          teacher={selectedTeacher}
          subjects={selectedSubjects}
          onClose={() => setSelectedSlug(null)}
        />
      )}
    </div>
  );
}
