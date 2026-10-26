import { useState } from 'react';
import { ArrowDownToLine, FileText, Search } from 'lucide-react';
import PageBanner from '../components/shared/PageBanner';
import Reveal from '../components/shared/Reveal';
import { ContentStatus, EditorialIntro } from '../components/shared/Editorial';
import { api, siteConfigValue } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';
const CATEGORIES = ['Reglamento', 'Formato', 'Normativa'];
export default function Normateca() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const {
    data: documents,
    loading,
    error,
  } = useApiData(
    () => api.documents({ category: category ?? undefined, q: query || undefined }),
    [category, query],
  );
  const { data: config } = useApiData(() => api.siteConfig(), []);
  return (
    <div className="interior-page resources-page">
      <PageBanner
        sculpture="resources"
        eyebrow="Normateca"
        title="Todo en su lugar."
        imageUrl={config ? siteConfigValue<string>(config, 'normateca.heroImageUrl') : undefined}
      />
      <section className="page-width section-space">
        <EditorialIntro title="Menos vueltas. Más claridad.">
          <p>
            Reglamentos, formatos y documentos para acompañar tu trayectoria en Ingeniería en
            Sistemas Computacionales.
          </p>
        </EditorialIntro>
        <div className="resource-workspace">
          <aside className="resource-sidebar">
            <p className="section-kicker">BIBLIOTECA ACADÉMICA</p>
            <h2>
              ¿Qué necesitas
              <br />
              consultar?
            </h2>
            <div role="group" aria-label="Categoría de documentos">
              {[null, ...CATEGORIES].map((item) => (
                <button
                  key={item ?? 'all'}
                  type="button"
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                  className={category === item ? 'selected' : ''}
                >
                  {item ?? 'Todos los documentos'}
                  <ArrowDownToLine size={15} />
                </button>
              ))}
            </div>
            <p className="resource-help">
              Consulta la fecha de actualización de cada documento antes de utilizarlo.
            </p>
          </aside>
          <div className="resource-results">
            <label className="resource-search">
              <Search size={19} />
              <input
                type="search"
                aria-label="Buscar en la normateca"
                placeholder="Buscar un documento…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <div className="result-count" role="status">
              {loading
                ? 'BUSCANDO…'
                : `${documents?.length ?? 0} DOCUMENTOS / ${category ?? 'TODOS'}`}
            </div>
            <ContentStatus
              loading={loading}
              error={error}
              empty={!documents?.length}
              noun="documentos para esta búsqueda"
            />
            <ul className="document-list">
              {documents?.map((doc, i) => (
                <li key={doc.id}>
                  <Reveal delayMs={(i % 5) * 40}>
                    <a href={doc.media.url} target="_blank" rel="noreferrer">
                      <span className="document-icon">
                        <FileText strokeWidth={1.2} size={26} />
                      </span>
                      <div>
                        <span className="section-kicker">{doc.category}</span>
                        <h3>{doc.title}</h3>
                        <p>Actualizado el {new Date(doc.updatedAt).toLocaleDateString('es-MX')}</p>
                      </div>
                      <ArrowDownToLine className="download-icon" size={22} />
                      <span className="sr-only">Abrir documento en otra pestaña</span>
                    </a>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
