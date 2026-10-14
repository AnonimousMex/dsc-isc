import { lazy, useState } from 'react';
import { LayoutGrid, Rows3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import GraduateAvatar from '../components/egresados/GraduateAvatar';
import Reveal from '../components/shared/Reveal';
import SectionHero3D from '../components/shared/SectionHero3D';
import { api, siteConfigValue } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

const GraduationRing = lazy(() => import('../components/three/GraduationRing'));

export default function Egresados() {
  const { data: config, loading } = useApiData(() => api.siteConfig(), []);
  const { data: graduates, loading: graduatesLoading, error } = useApiData(() => api.graduates(), []);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'galeria' | 'mosaico'>(() => {
    try { return localStorage.getItem('dsc-isc:egresados-view') === 'mosaico' ? 'mosaico' : 'galeria'; }
    catch { return 'galeria'; }
  });
  function selectView(next: 'galeria' | 'mosaico') {
    setView(next);
    try { localStorage.setItem('dsc-isc:egresados-view', next); } catch { /* Funciona sin almacenamiento. */ }
  }
  const filtered = (graduates ?? []).filter((graduate) => `${graduate.fullName} ${graduate.headline} ${graduate.city}`.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es')));

  const titulacion = config ? siteConfigValue<string>(config, 'egresados.titulacion') : undefined;
  const titulosRecibidos = config ? siteConfigValue<string>(config, 'egresados.titulosRecibidos') : undefined;
  const hasContent = Boolean(titulacion || titulosRecibidos);

  return (
    <div>
      <SectionHero3D eyebrow="Egresados" title="Titulación y egresados" scene={GraduationRing} />

      <section className="mx-auto max-w-6xl px-6 pt-16">
        <div className="flex flex-col justify-between gap-6 rounded-lg border border-line bg-elevated p-8 sm:flex-row sm:items-center">
          <div><h2 className="text-2xl font-bold text-ink">Soy un egresado</h2><p className="mt-3 max-w-xl text-sm text-muted">¿Ya te titulaste de ISC? Comparte tu experiencia, currículum y redes con nuestra comunidad. Publicaremos tu perfil después de verificar tu título.</p></div>
          <Link to="/egresados/registro" className="shrink-0 rounded-md bg-primary px-6 py-3 text-center text-sm font-medium text-surface">Registrar mi perfil</Link>
        </div>
        <div className="mt-14 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 id="comunidad-egresados" className="scroll-mt-24 text-2xl font-bold text-ink">Nuestra comunidad de egresados</h2>
          <input type="search" aria-label="Buscar egresados" placeholder="Nombre, profesión o ciudad…" value={query} onChange={(e) => setQuery(e.target.value)} className="rounded-md border border-line px-4 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal" />
        </div>
        {graduatesLoading && <p role="status" className="mt-8 text-muted">Cargando egresados…</p>}
        {error && <p role="alert" className="mt-8 text-red-700">No pudimos cargar los perfiles. Intenta de nuevo más tarde.</p>}
        {!graduatesLoading && !error && filtered.length === 0 && <p className="mt-8 text-muted">{query ? 'No hay perfiles que coincidan con tu búsqueda.' : 'Los perfiles verificados aparecerán aquí. Sé parte de nuestra comunidad.'}</p>}
        <div role="group" aria-label="Cambiar vista de egresados" className="mt-6 inline-flex overflow-hidden rounded-md border border-line">
          {(['mosaico', 'galeria'] as const).map((option) => <button key={option} type="button" onClick={() => selectView(option)} aria-pressed={view === option} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${view === option ? 'bg-primary text-surface' : 'text-muted hover:text-ink'}`}>
            {option === 'mosaico' ? <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" /> : <Rows3 className="h-3.5 w-3.5" aria-hidden="true" />}{option === 'mosaico' ? 'Mosaico' : 'Galería'}
          </button>)}
        </div>
        <div className={view === 'mosaico' ? 'mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4' : 'mt-8 flex flex-col divide-y divide-line'}>
          {filtered.map((graduate) => <Link key={graduate.id} to={`/egresados/perfil/${graduate.id}`} className={`group overflow-hidden bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal ${view === 'mosaico' ? 'rounded-lg border border-line transition-shadow hover:shadow-md' : 'flex flex-col gap-5 py-6 sm:flex-row sm:items-center'}`}>
            <div className={view === 'mosaico' ? 'aspect-square' : 'h-32 w-32 shrink-0 overflow-hidden rounded-lg'}><GraduateAvatar graduate={graduate} /></div>
            <div className={view === 'mosaico' ? 'p-5' : 'min-w-0 flex-1'}><h3 className="font-semibold text-ink group-hover:text-primary">{graduate.fullName}</h3><p className="mt-2 text-sm text-muted">{graduate.headline}</p>{view === 'galeria' && <><p className="mt-2 text-sm text-muted">{graduate.city}</p><p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-muted">{graduate.bio}</p></>}<p className="mt-3 font-mono text-xs text-primary">Titulación {graduate.graduationYear}</p></div>
          </Link>)}
        </div>
      </section>

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
