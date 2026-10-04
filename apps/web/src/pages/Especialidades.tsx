import { lazy } from 'react';
import { Link } from 'react-router-dom';
import { resizeImageUrl, type Specialty } from '@dsc-isc/shared';
import Reveal from '../components/shared/Reveal';
import SectionHero3D from '../components/shared/SectionHero3D';
import { api } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';
import { useTilt } from '../lib/useTilt';

const BranchTree = lazy(() => import('../components/three/BranchTree'));

function SpecialtyCard({ specialty }: { specialty: Specialty }) {
  const { ref, style, onMouseMove, onMouseLeave } = useTilt<HTMLAnchorElement>();

  return (
    <Link
      ref={ref}
      to={`/especialidades/${specialty.slug}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={style}
      className="group relative block aspect-[3/4] overflow-hidden rounded-xl shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
    >
      {specialty.image && (
        <img
          src={resizeImageUrl(specialty.image.url, 700)}
          alt={specialty.image.alt ?? specialty.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-deep/95 via-deep/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-surface">
        <span className="font-mono text-[11px] uppercase tracking-widest text-signal">Especialidad</span>
        <h2 className="mt-2 text-xl font-bold leading-tight">{specialty.name}</h2>
        <p className="mt-2 line-clamp-3 text-sm text-line">{specialty.description}</p>
      </div>
    </Link>
  );
}

export default function Especialidades() {
  const { data: specialties } = useApiData(() => api.specialties(), []);

  return (
    <div>
      <SectionHero3D
        eyebrow="Posgrado"
        title="Retículas y especialidades"
        description="Tres especialidades para continuar la formación después de la licenciatura."
        scene={BranchTree}
      />

      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 sm:grid-cols-3">
          {(specialties ?? []).map((specialty, i) => (
            <Reveal key={specialty.id} delayMs={i * 100}>
              <SpecialtyCard specialty={specialty} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
