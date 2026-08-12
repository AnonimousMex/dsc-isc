import Reveal from '../components/shared/Reveal';
import SectionEyebrow from '../components/shared/SectionEyebrow';
import { api, siteConfigValue } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

export default function Egresados() {
  const { data: config, loading } = useApiData(() => api.siteConfig(), []);

  const titulacion = config ? siteConfigValue<string>(config, 'egresados.titulacion') : undefined;
  const titulosRecibidos = config ? siteConfigValue<string>(config, 'egresados.titulosRecibidos') : undefined;
  const hasContent = Boolean(titulacion || titulosRecibidos);

  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <Reveal>
        <SectionEyebrow>Egresados</SectionEyebrow>
        <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Titulación y egresados</h1>
      </Reveal>

      {!loading && !hasContent && (
        <p className="mt-10 text-sm text-muted">Esta sección aún no tiene contenido publicado.</p>
      )}

      {titulacion && (
        <Reveal delayMs={80} className="mt-12">
          <h2 id="titulacion" className="text-lg font-bold text-ink">
            Titulación
          </h2>
          <p className="mt-2 text-sm text-muted">{titulacion}</p>
        </Reveal>
      )}

      {titulosRecibidos && (
        <Reveal delayMs={140} className="mt-12">
          <h2 id="titulos-recibidos" className="text-lg font-bold text-ink">
            Títulos recibidos
          </h2>
          <p className="mt-2 text-sm text-muted">{titulosRecibidos}</p>
        </Reveal>
      )}
    </div>
  );
}
