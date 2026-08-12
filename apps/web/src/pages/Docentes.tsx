import TeacherCard from '../components/docentes/TeacherCard';
import Reveal from '../components/shared/Reveal';
import SectionEyebrow from '../components/shared/SectionEyebrow';
import { api } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

export default function Docentes() {
  const { data: teachers, loading } = useApiData(() => api.teachers(), []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <SectionEyebrow>Nosotros</SectionEyebrow>
        <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Docentes</h1>
        <p className="mt-4 max-w-2xl text-muted">
          El cuerpo académico que imparte las materias del departamento.
        </p>
      </Reveal>

      {!loading && teachers && teachers.length === 0 && (
        <p className="mt-10 text-sm text-muted">Aún no hay docentes publicados.</p>
      )}

      <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {(teachers ?? []).map((teacher, i) => (
          <Reveal key={teacher.id} delayMs={(i % 4) * 60}>
            <TeacherCard teacher={teacher} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
