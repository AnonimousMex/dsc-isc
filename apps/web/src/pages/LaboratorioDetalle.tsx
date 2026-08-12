import { useParams } from 'react-router-dom';
import { resizeImageUrl } from '@dsc-isc/shared';
import Reveal from '../components/shared/Reveal';
import SectionEyebrow from '../components/shared/SectionEyebrow';
import { api } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

export default function LaboratorioDetalle() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: lab, loading, error } = useApiData(() => api.lab(slug), [slug]);

  if (loading) return null;

  if (error || !lab) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center px-6 py-32">
        <SectionEyebrow>Laboratorios</SectionEyebrow>
        <h1 className="mt-3 text-3xl font-bold text-ink">Laboratorio no encontrado</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <Reveal>
        <SectionEyebrow>Laboratorios</SectionEyebrow>
        <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">{lab.name}</h1>
        <p className="mt-4 text-muted">{lab.description}</p>
      </Reveal>

      {lab.gallery.length > 0 && (
        <Reveal delayMs={80} className="mt-10 grid gap-4 sm:grid-cols-2">
          {lab.gallery.map((media) => (
            <img
              key={media.id}
              src={resizeImageUrl(media.url, 700)}
              alt={media.alt ?? lab.name}
              className="aspect-video w-full rounded-lg object-cover"
              loading="lazy"
            />
          ))}
        </Reveal>
      )}

      {lab.equipment.length > 0 && (
        <Reveal delayMs={120} className="mt-12">
          <h2 className="text-lg font-bold text-ink">Equipo</h2>
          <ul className="mt-4 flex flex-col divide-y divide-line rounded-lg border border-line">
            {lab.equipment.map((item) => (
              <li key={`${item.label}-${item.value}`} className="flex items-center gap-4 px-4 py-3">
                <span className="font-mono text-sm font-bold text-primary">{item.label}</span>
                <span className="text-sm text-muted">{item.value}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {lab.relatedSubjects.length > 0 && (
        <Reveal delayMs={160} className="mt-12">
          <h2 className="text-lg font-bold text-ink">Materias que se imparten aquí</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {lab.relatedSubjects.map((name) => (
              <span key={name} className="rounded-full border border-line px-3 py-1 text-xs text-ink">
                {name}
              </span>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}
