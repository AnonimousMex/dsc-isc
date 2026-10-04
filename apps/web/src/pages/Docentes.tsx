import TeacherCard from '../components/docentes/TeacherCard';
import PageBanner from '../components/shared/PageBanner';
import Reveal from '../components/shared/Reveal';
import { api, siteConfigValue } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

export default function Docentes() {
  const { data: teachers, loading } = useApiData(() => api.teachers(), []);
  const { data: config } = useApiData(() => api.siteConfig(), []);
  const heroImageUrl = config ? siteConfigValue<string>(config, 'docentes.heroImageUrl') : undefined;

  return (
    <div>
      <PageBanner
        eyebrow="Nosotros"
        title="Docentes"
        imageUrl={heroImageUrl}
        imageAlt="Cuerpo docente del Departamento de Sistemas y Computación"
      />

      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm text-muted">El cuerpo académico que imparte las materias del departamento.</p>

        {!loading && teachers && teachers.length === 0 && (
          <p className="mt-8 text-sm text-muted">Aún no hay docentes publicados.</p>
        )}

        <div className="mt-6 flex flex-col divide-y divide-line">
          {(teachers ?? []).map((teacher, i) => (
            <Reveal key={teacher.id} delayMs={(i % 6) * 40}>
              <TeacherCard teacher={teacher} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
