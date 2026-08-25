import { Link } from 'react-router-dom';
import { resizeImageUrl } from '@dsc-isc/shared';
import Reveal from '../components/shared/Reveal';
import SectionEyebrow from '../components/shared/SectionEyebrow';
import { api } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

export default function Especialidades() {
  const { data: specialties } = useApiData(() => api.specialties(), []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <SectionEyebrow>Posgrado</SectionEyebrow>
        <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Retículas y especialidades</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Tres especialidades para continuar la formación después de la licenciatura.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {(specialties ?? []).map((specialty, i) => (
          <Reveal key={specialty.id} delayMs={i * 100}>
            <Link
              to={`/especialidades/${specialty.slug}`}
              className="block h-full overflow-hidden rounded-lg border border-line bg-surface transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
            >
              <article className="h-full">
                {specialty.image && (
                  <img
                    src={resizeImageUrl(specialty.image.url, 500)}
                    alt={specialty.image.alt ?? specialty.name}
                    width={500}
                    height={375}
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="p-5">
                  <h2 className="text-lg font-bold text-ink">{specialty.name}</h2>
                  <p className="mt-2 text-sm text-muted">{specialty.description}</p>
                </div>
              </article>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
