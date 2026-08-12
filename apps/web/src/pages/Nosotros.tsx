import InteractiveTimeline from '../components/timeline/InteractiveTimeline';
import Reveal from '../components/shared/Reveal';
import SectionEyebrow from '../components/shared/SectionEyebrow';
import { api, siteConfigValue } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

export default function Nosotros() {
  const { data: timeline } = useApiData(() => api.timeline(), []);
  const { data: config } = useApiData(() => api.siteConfig(), []);

  const mission = config ? siteConfigValue<string>(config, 'nosotros.mision') : undefined;
  const vision = config ? siteConfigValue<string>(config, 'nosotros.vision') : undefined;
  const values = config ? siteConfigValue<string[]>(config, 'nosotros.valores') : undefined;

  return (
    <div>
      <section className="mx-auto max-w-4xl px-6 py-24">
        <Reveal>
          <SectionEyebrow>Nosotros</SectionEyebrow>
          <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Historia y valores</h1>
          <p className="mt-4 max-w-2xl text-muted">
            Desde 1988, el Departamento de Sistemas y Computación forma ingenieros e informáticos
            para la industria y la investigación aplicada.
          </p>
        </Reveal>

        {timeline && timeline.length > 0 && (
          <Reveal delayMs={100} className="mt-16">
            <InteractiveTimeline events={timeline} />
          </Reveal>
        )}
      </section>

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
