const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function getCookie(name: string): string | undefined {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
}

let refreshPromise: Promise<void> | null = null;

async function refreshSession(): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/refresh`, { method: 'POST', credentials: 'include' });
  if (!res.ok) throw new ApiError(res.status, 'No se pudo renovar la sesión');
}

/**
 * Cliente HTTP base del sistema. A diferencia del de `apps/web`, este sí
 * muta datos: manda `credentials: 'include'` (cookies httpOnly de sesión),
 * agrega el header `X-CSRF-Token` en toda mutación (leído de la cookie
 * `csrfToken`, no httpOnly — ver apps/api/src/lib/csrf.ts) y, si el access
 * token expiró (401), intenta renovar la sesión una sola vez antes de
 * reintentar la petición original.
 */
export async function request<T>(path: string, init: RequestInit = {}, allowRetry = true): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase();
  const isMutating = method !== 'GET' && method !== 'HEAD';

  const headers = new Headers(init.headers);
  if (isMutating && !(init.body instanceof FormData)) {
    headers.set('content-type', 'application/json');
  }
  if (isMutating) {
    const csrfToken = getCookie('csrfToken');
    if (csrfToken) headers.set('x-csrf-token', csrfToken);
  }

  const res = await fetch(`${API_URL}/api${path}`, { ...init, headers, credentials: 'include' });

  if (res.status === 401 && allowRetry && !path.startsWith('/auth/')) {
    refreshPromise ??= refreshSession().finally(() => {
      refreshPromise = null;
    });
    try {
      await refreshPromise;
      return request<T>(path, init, false);
    } catch {
      // Cae al manejo de error normal de abajo.
    }
  }

  if (!res.ok) {
    let body: { error?: string; details?: unknown } | null = null;
    try {
      body = await res.json();
    } catch {
      // Respuesta sin cuerpo JSON (ej. 204 en un error inesperado).
    }
    throw new ApiError(res.status, body?.error ?? `Error ${res.status}`, body?.details);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const apiGet = <T>(path: string) => request<T>(path);
export const apiPost = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined });
export const apiPut = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined });
export const apiDelete = <T>(path: string) => request<T>(path, { method: 'DELETE' });

export async function uploadFile(file: File, alt?: string): Promise<{ id: string; url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  if (alt) formData.append('alt', alt);
  return request('/media/upload', { method: 'POST', body: formData });
}
