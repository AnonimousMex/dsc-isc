import { useState } from 'react';
import { Search } from 'lucide-react';
import type { OpenAlexAuthorCandidate } from '@dsc-isc/shared';
import { apiGet, ApiError } from '../lib/apiClient';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface OpenAlexLinkFieldProps {
  value: string;
  onChange: (openAlexId: string) => void;
  /** Nombre del docente, para prellenar la búsqueda. */
  defaultQuery: string;
}

/**
 * Enlaza al docente con su autor en OpenAlex. Busca por nombre y muestra
 * candidatos con institución/ORCID/publicaciones para que se elija a mano
 * al correcto — un nombre por sí solo no identifica de forma única a un
 * investigador (dos personas distintas pueden llamarse igual), así que
 * nunca se enlaza en automático al primer resultado.
 */
export default function OpenAlexLinkField({ value, onChange, defaultQuery }: OpenAlexLinkFieldProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [candidates, setCandidates] = useState<OpenAlexAuthorCandidate[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    if (query.trim().length < 2) return;
    setSearching(true);
    setError(null);
    try {
      const results = await apiGet<OpenAlexAuthorCandidate[]>(
        `/teachers/openalex-search?q=${encodeURIComponent(query.trim())}`,
      );
      setCandidates(results);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo buscar en OpenAlex');
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="openAlexId">Autor en OpenAlex (publicaciones)</Label>
      <div className="flex gap-2">
        <Input
          id="openAlexId"
          value={value}
          onChange={(e) => onChange(e.target.value.trim())}
          placeholder="Ej. A5017972615"
        />
        {value && (
          <Button type="button" variant="outline" size="sm" onClick={() => onChange('')}>
            Quitar
          </Button>
        )}
      </div>

      <div className="mt-1 flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), search())}
          placeholder="Buscar investigador por nombre…"
          className="text-sm"
        />
        <Button type="button" variant="outline" size="sm" onClick={search} disabled={searching}>
          <Search className="h-3.5 w-3.5" />
          {searching ? 'Buscando…' : 'Buscar'}
        </Button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {candidates && (
        <div className="mt-1 flex max-h-56 flex-col gap-1 overflow-y-auto rounded-md border border-line p-1">
          {candidates.length === 0 && <p className="p-2 text-xs text-muted">Sin resultados.</p>}
          {candidates.map((candidate) => (
            <button
              key={candidate.openAlexId}
              type="button"
              onClick={() => {
                onChange(candidate.openAlexId);
                setCandidates(null);
              }}
              className={`rounded px-2 py-1.5 text-left text-xs hover:bg-elevated ${
                candidate.openAlexId === value ? 'bg-elevated ring-1 ring-primary' : ''
              }`}
            >
              <span className="block font-medium text-ink">{candidate.name}</span>
              <span className="block text-muted">
                {candidate.institution ?? 'Institución no disponible'} · {candidate.worksCount} publicaciones ·{' '}
                {candidate.orcid ? 'con ORCID' : 'sin ORCID'}
              </span>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted">
        Un mismo nombre puede corresponder a varias personas — verifica institución/ORCID antes de elegir.
      </p>
    </div>
  );
}
