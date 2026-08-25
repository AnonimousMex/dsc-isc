import { useParams } from 'react-router-dom';
import { resizeImageUrl } from '@dsc-isc/shared';
import Reveal from '../components/shared/Reveal';
import SectionEyebrow from '../components/shared/SectionEyebrow';
import { api } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

export default function EspecialidadDetalle() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: specialty, loading, error } = useApiData(() => api.specialty(slug), [slug]);

  if (loading) return null;

  if (error || !specialty) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center px-6 py-32">
        <SectionEyebrow>Posgrado</SectionEyebrow>
        <h1 className="mt-3 text-3xl font-bold text-ink">Especialidad no encontrada</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <Reveal>
        <SectionEyebrow>Posgrado</SectionEyebrow>
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
  );
}
