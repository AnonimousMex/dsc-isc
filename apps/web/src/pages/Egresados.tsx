import { EditorialIntro } from '../components/shared/Editorial';
import { useState } from 'react';
import { LayoutGrid, Rows3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import GraduateAvatar from '../components/egresados/GraduateAvatar';
import PageBanner from '../components/shared/PageBanner';
import Reveal from '../components/shared/Reveal';
import { api, siteConfigValue } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

export default function Egresados() {
  const { data: config, loading } = useApiData(() => api.siteConfig(), []);
  const {
    data: graduates,
    loading: graduatesLoading,
    error,
  } = useApiData(() => api.graduates(), []);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'galeria' | 'mosaico'>(() => {
    try {
      return localStorage.getItem('dsc-isc:egresados-view') === 'mosaico' ? 'mosaico' : 'galeria';
    } catch {
      return 'galeria';
    }
  });
  function selectView(next: 'galeria' | 'mosaico') {
    setView(next);
    try {
      localStorage.setItem('dsc-isc:egresados-view', next);
    } catch {
      /* Funciona sin almacenamiento. */
    }
  }
  const filtered = (graduates ?? []).filter((graduate) =>
    `${graduate.fullName} ${graduate.headline} ${graduate.city}`
      .toLocaleLowerCase('es')
      .includes(query.toLocaleLowerCase('es')),
  );

  const titulacion = config ? siteConfigValue<string>(config, 'egresados.titulacion') : undefined;
  const titulosRecibidos = config
    ? siteConfigValue<string>(config, 'egresados.titulosRecibidos')
    : undefined;
  const hasContent = Boolean(titulacion || titulosRecibidos);

  const heroImageUrl = config
    ? siteConfigValue<string>(config, 'egresados.heroImageUrl')
    : undefined;

  return (
    <div className="interior-page graduates-page">
      <PageBanner
        eyebrow="Egresados"
        title="El siguiente capítulo lo escribes tú."
        imageUrl={heroImageUrl ?? '/images/comunidad.jpg'}
        imageAlt="Fotografía editorial de colaboración profesional"
      />

      <section className="page-width section-space">
        <EditorialIntro title="Trayectorias que nos conectan.">
          <p>
            Conoce a quienes ya llevaron su talento más allá del aula y comparte tu propio camino en
            Ingeniería en Sistemas Computacionales.
          </p>
        </EditorialIntro>
        <div className="graduate-invitation">
          <div>
            <h2 className="text-2xl font-bold text-ink">Soy un egresado</h2>
            <p className="mt-3 max-w-xl text-sm text-muted">
              ¿Ya te titulaste de ISC? Comparte tu experiencia, currículum y redes con nuestra
              comunidad. Publicaremos tu perfil después de verificar tu título.
            </p>
          </div>
          <Link to="/egresados/registro" className="btn-primary shrink-0">
            Registrar mi perfil
          </Link>
        </div>
        <div className="graduate-directory-heading">
          <h2 id="comunidad-egresados" className="scroll-mt-24 text-2xl font-bold text-ink">
            Nuestra comunidad de egresados
          </h2>
          <input
            type="search"
            aria-label="Buscar egresados"
            placeholder="Nombre, profesión o ciudad…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-md border border-line px-4 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
          />
        </div>
        {graduatesLoading && (
          <p role="status" className="mt-8 text-muted">
            Cargando egresados…
          </p>
        )}
        {error && (
          <p role="alert" className="mt-8 text-red-700">
            No pudimos cargar los perfiles. Intenta de nuevo más tarde.
          </p>
        )}
        {!graduatesLoading && !error && filtered.length === 0 && (
          <p className="mt-8 text-muted">
            {query
              ? 'No hay perfiles que coincidan con tu búsqueda.'
              : 'Los perfiles verificados aparecerán aquí. Sé parte de nuestra comunidad.'}
          </p>
        )}
        <div role="group" aria-label="Cambiar vista de egresados" className="mt-6 flex gap-2">
          {(['mosaico', 'galeria'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => selectView(option)}
              aria-pressed={view === option}
              className={view === option ? 'pill-gold-active' : 'pill-gold'}
            >
              {option === 'mosaico' ? (
                <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Rows3 className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {option === 'mosaico' ? 'Mosaico' : 'Galería'}
            </button>
          ))}
        </div>
        <div
          className={
            view === 'mosaico'
              ? 'mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'
              : 'mt-8 flex flex-col'
          }
        >
          {filtered.map((graduate) => (
            <Link
              key={graduate.id}
              to={`/egresados/perfil/${graduate.id}`}
              className={`group overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal ${view === 'mosaico' ? 'card-interactive' : 'flex flex-col gap-5 border-b border-line/10 py-6 sm:flex-row sm:items-center'}`}
            >
              <div
                className={
                  view === 'mosaico'
                    ? 'aspect-square'
                    : 'h-32 w-32 shrink-0 overflow-hidden rounded-lg'
                }
              >
                <GraduateAvatar graduate={graduate} />
              </div>
              <div className={view === 'mosaico' ? 'p-5' : 'min-w-0 flex-1'}>
                <h3 className="break-words font-semibold text-ink group-hover:text-primary">
                  {graduate.fullName}
                </h3>
                <p className="mt-2 break-words text-sm text-muted">{graduate.headline}</p>
                {view === 'galeria' && (
                  <>
                    <p className="mt-2 text-sm text-muted">{graduate.city}</p>
                    <p className="mt-3 line-clamp-3 whitespace-pre-wrap break-words text-sm text-muted">
                      {graduate.bio}
                    </p>
                  </>
                )}
                <p className="mt-3 font-mono text-xs text-primary">
                  Titulación {graduate.graduationYear}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="page-width graduation-information">
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
