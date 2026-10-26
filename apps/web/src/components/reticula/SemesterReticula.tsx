import { useMemo, useState } from 'react';
import type { Subject, TeacherSummary } from '@dsc-isc/shared';
import SubjectCard from './SubjectCard';
import SubjectModal from './SubjectModal';

interface SemesterReticulaProps {
  subjects: Subject[];
  teachersById: Record<string, TeacherSummary>;
}

/**
 * Retícula por semestre: selector horizontal de periodos (solo los que
 * tienen materias cargadas) y, debajo, la rejilla de materias de ese
 * semestre. Reemplaza la visualización de circuito/prerrequisitos por un
 * patrón más simple de hojear, estilo tec.mx.
 */
export default function SemesterReticula({ subjects, teachersById }: SemesterReticulaProps) {
  const semesters = useMemo(
    () => [...new Set(subjects.map((s) => s.semester))].sort((a, b) => a - b),
    [subjects],
  );
  const [active, setActive] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const currentSemester = active ?? semesters[0] ?? 1;
  const visible = subjects.filter((s) => s.semester === currentSemester);
  const selectedSubject = subjects.find((s) => s.id === selectedId) ?? null;

  if (subjects.length === 0) {
    return <p className="text-sm text-muted">Aún no hay materias publicadas para esta retícula.</p>;
  }

  return (
    <div>
      <div role="tablist" aria-label="Semestre" className="flex flex-wrap gap-2 overflow-x-auto pb-2">
        {semesters.map((semester) => (
          <button
            key={semester}
            type="button"
            role="tab"
            aria-selected={semester === currentSemester}
            onClick={() => setActive(semester)}
            className={`shrink-0 ${semester === currentSemester ? 'pill-gold-active' : 'pill-gold'}`}
          >
            Semestre {semester}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} onSelect={setSelectedId} />
        ))}
      </div>

      {selectedSubject && (
        <SubjectModal
          subject={selectedSubject}
          allSubjects={subjects}
          teachersById={teachersById}
          onClose={() => setSelectedId(null)}
          onSelectPrerequisite={setSelectedId}
        />
      )}
    </div>
  );
}
