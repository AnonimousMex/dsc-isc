import { Suspense, lazy, useEffect, useState } from 'react';
import LabTiltCard from '../components/laboratorios/LabTiltCard';
import Reveal from '../components/shared/Reveal';
import SectionEyebrow from '../components/shared/SectionEyebrow';
import { api } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

const LabRack3D = lazy(() => import('../components/laboratorios/LabRack3D'));

export default function Laboratorios() {
  const { data: labs } = useApiData(() => api.labs(), []);
  const [showRack, setShowRack] = useState(false);

  useEffect(() => {
    setShowRack(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  return (
    <div>
      <section className="relative flex min-h-[70svh] flex-col items-center justify-center overflow-hidden bg-deep px-6 text-center text-surface">
        {showRack && (
          <div className="absolute inset-0 opacity-40">
            <Suspense fallback={null}>
              <LabRack3D />
            </Suspense>
          </div>
        )}
        <Reveal>
          <SectionEyebrow tone="light">Nosotros</SectionEyebrow>
          <h1 className="mt-3 text-3xl font-bold sm:text-5xl">Laboratorios</h1>
          <p className="mt-4 max-w-md text-sm text-line">
            Los espacios donde la teoría se vuelve práctica.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 sm:grid-cols-2">
          {(labs ?? []).map((lab, i) => (
            <Reveal key={lab.id} delayMs={i * 80}>
              <LabTiltCard lab={lab} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
