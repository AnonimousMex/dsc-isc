import { useEffect, useState } from 'react';

interface ApiDataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook mínimo de fetch reutilizado por todas las páginas que consumen la
 * API pública (sección "todo texto/imagen/dato vive en la base de datos").
 */
export function useApiData<T>(fetcher: () => Promise<T>, deps: unknown[] = []): ApiDataState<T> {
  const [state, setState] = useState<ApiDataState<T>>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true }));
    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({ data: null, loading: false, error: err instanceof Error ? err : new Error(String(err)) });
        }
      });
    return () => {
      cancelled = true;
    };
    // `deps` es intencionalmente dinámico (lo define quien llama al hook),
    // igual que el segundo argumento de cualquier wrapper genérico sobre
    // useEffect — oxlint no puede verificarlo estáticamente y por eso
    // marca advertencia aquí; es un patrón estándar, no un error real.
  }, deps);

  return state;
}
