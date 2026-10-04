import { useEffect, useState } from 'react';
import { LayoutGrid, Rows3 } from 'lucide-react';
import TeacherCard from '../components/docentes/TeacherCard';
import TeacherCardGrid from '../components/docentes/TeacherCardGrid';
import PageBanner from '../components/shared/PageBanner';
import Reveal from '../components/shared/Reveal';
import { api, siteConfigValue } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

type DocentesView = 'galeria' | 'mosaico';

const VIEW_STORAGE_KEY = 'dsc-isc:docentes-view';

export default function Docentes() {
  const { data: teachers, loading } = useApiData(() => api.teachers(), []);
  const { data: config } = useApiData(() => api.siteConfig(), []);
  const heroImageUrl = config ? siteConfigValue<string>(config, 'docentes.heroImageUrl') : undefined;

  const [view, setView] = useState<DocentesView>('galeria');

  useEffect(() => {
    const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (stored === 'galeria' || stored === 'mosaico') setView(stored);
  }, []);

  function selectView(next: DocentesView) {
    setView(next);
    window.localStorage.setItem(VIEW_STORAGE_KEY, next);
  }

  return (
    <div>
      <PageBanner
        eyebrow="Nosotros"
        title="Docentes"
        imageUrl={heroImageUrl}
        imageAlt="Cuerpo docente del Departamento de Sistemas y Computación"
      />

      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className="text-sm text-muted">El cuerpo académico que imparte las materias del departamento.</p>

          <div
            role="group"
            aria-label="Cambiar vista de docentes"
            className="flex shrink-0 overflow-hidden rounded-md border border-line"
          >
            <button
              type="button"
              onClick={() => selectView('mosaico')}
              aria-pressed={view === 'mosaico'}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                view === 'mosaico' ? 'bg-primary text-surface' : 'text-muted hover:text-ink'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
              Mosaico
            </button>
            <button
              type="button"
              onClick={() => selectView('galeria')}
              aria-pressed={view === 'galeria'}
              className={`flex items-center gap-1.5 border-l border-line px-3 py-1.5 text-xs font-medium transition-colors ${
                view === 'galeria' ? 'bg-primary text-surface' : 'text-muted hover:text-ink'
              }`}
            >
              <Rows3 className="h-3.5 w-3.5" aria-hidden="true" />
              Galería
            </button>
          </div>
        </div>

        {!loading && teachers && teachers.length === 0 && (
          <p className="mt-8 text-sm text-muted">Aún no hay docentes publicados.</p>
        )}

        {view === 'galeria' ? (
          <div className="mt-6 flex flex-col divide-y divide-line">
            {(teachers ?? []).map((teacher, i) => (
              <Reveal key={teacher.id} delayMs={(i % 6) * 40}>
                <TeacherCard teacher={teacher} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {(teachers ?? []).map((teacher, i) => (
              <Reveal key={teacher.id} delayMs={(i % 4) * 60}>
                <TeacherCardGrid teacher={teacher} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
