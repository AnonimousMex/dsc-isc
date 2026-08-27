import { lazy } from 'react';
import Reveal from '../components/shared/Reveal';
import SectionHero3D from '../components/shared/SectionHero3D';
import { api, siteConfigValue } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

const GraduationRing = lazy(() => import('../components/three/GraduationRing'));

export default function Egresados() {
  const { data: config, loading } = useApiData(() => api.siteConfig(), []);

  const titulacion = config ? siteConfigValue<string>(config, 'egresados.titulacion') : undefined;
  const titulosRecibidos = config ? siteConfigValue<string>(config, 'egresados.titulosRecibidos') : undefined;
  const hasContent = Boolean(titulacion || titulosRecibidos);

  return (
    <div>
      <SectionHero3D eyebrow="Egresados" title="Titulación y egresados" scene={GraduationRing} />

      <div className="mx-auto max-w-4xl px-6 py-20">
        {!loading && !hasContent && (
          <p className="text-sm text-muted">Esta sección aún no tiene contenido publicado.</p>
        )}

        {titulacion && (
          <Reveal>
            <h2 id="titulacion" className="text-lg font-bold text-ink">
              Titulación
            </h2>
            <p className="mt-2 text-sm text-muted">{titulacion}</p>
          </Reveal>
        )}

        {titulosRecibidos && (
          <Reveal delayMs={80} className="mt-12">
            <h2 id="titulos-recibidos" className="text-lg font-bold text-ink">
              Títulos recibidos
            </h2>
            <p className="mt-2 text-sm text-muted">{titulosRecibidos}</p>
          </Reveal>
        )}
      </div>
    </div>
  );
}
