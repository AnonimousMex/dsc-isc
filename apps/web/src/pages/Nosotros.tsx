import { lazy } from 'react';
import InteractiveTimeline from '../components/timeline/InteractiveTimeline';
import Reveal from '../components/shared/Reveal';
import SectionEyebrow from '../components/shared/SectionEyebrow';
import SectionHero3D from '../components/shared/SectionHero3D';
import { api, siteConfigValue } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

const TimelineHelix = lazy(() => import('../components/three/TimelineHelix'));

export default function Nosotros() {
  const { data: timeline } = useApiData(() => api.timeline(), []);
  const { data: config } = useApiData(() => api.siteConfig(), []);

  const mission = config ? siteConfigValue<string>(config, 'nosotros.mision') : undefined;
  const vision = config ? siteConfigValue<string>(config, 'nosotros.vision') : undefined;
  const values = config ? siteConfigValue<string[]>(config, 'nosotros.valores') : undefined;
  const heroImageUrl = config ? siteConfigValue<string>(config, 'nosotros.heroImageUrl') : undefined;

  return (
    <div>
      <SectionHero3D
        eyebrow="Nosotros"
        title="Historia y valores"
        description="Desde 1988, el Departamento de Sistemas y Computación forma ingenieros e informáticos para la industria y la investigación aplicada."
        scene={TimelineHelix}
      />

      <section className="mx-auto max-w-4xl px-6 py-20">
        {timeline && timeline.length > 0 && (
          <Reveal>
            <InteractiveTimeline events={timeline} />
          </Reveal>
        )}
      </section>

      {heroImageUrl && (
        <Reveal>
          <section className="relative h-[50svh] min-h-[320px] overflow-hidden">
            <img
              src={heroImageUrl}
              alt="Instalaciones del Departamento de Sistemas y Computación"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep/80 via-deep/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8">
              <p className="font-mono text-xs uppercase tracking-widest text-signal">Desde 1988</p>
              <p className="mt-2 max-w-md text-lg font-bold text-surface">
                Más de tres décadas formando ingenieros e informáticos.
              </p>
            </div>
          </section>
        </Reveal>
      )}

      <section className="border-t border-line bg-elevated px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <SectionEyebrow>¿Quiénes somos?</SectionEyebrow>
          </Reveal>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <Reveal delayMs={0}>
              <article className="h-full rounded-lg border border-line bg-surface p-6">
                <h2 className="text-lg font-bold text-ink">Misión</h2>
                <p className="mt-3 text-sm text-muted">{mission ?? 'Contenido pendiente de captura.'}</p>
              </article>
            </Reveal>
            <Reveal delayMs={80}>
              <article className="h-full rounded-lg border border-line bg-surface p-6">
                <h2 className="text-lg font-bold text-ink">Visión</h2>
                <p className="mt-3 text-sm text-muted">{vision ?? 'Contenido pendiente de captura.'}</p>
              </article>
            </Reveal>
            <Reveal delayMs={160}>
              <article className="h-full rounded-lg border border-line bg-surface p-6">
                <h2 className="text-lg font-bold text-ink">Valores</h2>
                <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
                  {(values ?? []).map((value) => (
                    <li key={value} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                      {value}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
