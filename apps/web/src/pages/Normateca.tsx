import { useState } from 'react';
import Reveal from '../components/shared/Reveal';
import SectionEyebrow from '../components/shared/SectionEyebrow';
import { api } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

const CATEGORIES = ['Reglamento', 'Formato', 'Normativa'] as const;

export default function Normateca() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const { data: documents, loading } = useApiData(
    () => api.documents({ category: category ?? undefined, q: query || undefined }),
    [category, query],
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <Reveal>
        <SectionEyebrow>Nosotros</SectionEyebrow>
        <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Normateca</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Reglamentos, formatos y documentos normativos del departamento, incluido el reglamento de
          laboratorios.
        </p>
      </Reveal>

      <Reveal
        delayMs={80}
        className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar documento..."
          className="w-full rounded-md border border-line bg-surface px-4 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal sm:max-w-xs"
          aria-label="Buscar en la normateca"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={`rounded-full border px-3 py-1 text-xs ${
              category === null
                ? 'border-primary bg-primary text-surface'
                : 'border-line text-muted'
            }`}
          >
            Todos
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-1 text-xs ${
                category === c ? 'border-primary bg-primary text-surface' : 'border-line text-muted'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Reveal>

      <div className="mt-8">
        {!loading && documents && documents.length === 0 && (
          <p className="text-sm text-muted">Aún no hay documentos publicados en esta categoría.</p>
        )}
        {documents && documents.length > 0 && (
          <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
            {documents.map((doc) => (
              <li key={doc.id}>
                <a
                  href={doc.media.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-elevated"
                >
                  <div>
                    <p className="font-medium text-ink">{doc.title}</p>
                    <p className="mt-1 font-mono text-xs text-muted">
                      {doc.category} · actualizado{' '}
                      {new Date(doc.updatedAt).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-accent">Ver documento →</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
