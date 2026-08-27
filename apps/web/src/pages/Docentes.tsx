import { lazy } from 'react';
import TeacherCard from '../components/docentes/TeacherCard';
import Reveal from '../components/shared/Reveal';
import SectionHero3D from '../components/shared/SectionHero3D';
import { api } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

const FacultyGrid = lazy(() => import('../components/three/FacultyGrid'));

export default function Docentes() {
  const { data: teachers, loading } = useApiData(() => api.teachers(), []);

  return (
    <div>
      <SectionHero3D
        eyebrow="Nosotros"
        title="Docentes"
        description="El cuerpo académico que imparte las materias del departamento."
        scene={FacultyGrid}
      />

      <div className="mx-auto max-w-6xl px-6 py-20">
        {!loading && teachers && teachers.length === 0 && (
          <p className="text-sm text-muted">Aún no hay docentes publicados.</p>
        )}

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {(teachers ?? []).map((teacher, i) => (
            <Reveal key={teacher.id} delayMs={(i % 4) * 60}>
              <TeacherCard teacher={teacher} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
