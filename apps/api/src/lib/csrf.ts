import { randomBytes } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const CSRF_COOKIE_NAME = 'csrfToken';
export const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Protección CSRF de "doble envío" (double-submit cookie): al hacer login
 * se emite un valor aleatorio en una cookie NO httpOnly (el JS del cliente
 * sí puede leerla) y el cliente debe reenviarlo en el header
 * `X-CSRF-Token` en cada mutación. Un sitio atacante puede forzar al
 * navegador a mandar la cookie de sesión, pero no puede leer la cookie CSRF
 * de otro origen para copiarla al header — así se detecta la falsificación.
 * Se usa este patrón (en vez de `csurf`, que está sin mantenimiento) porque
 * es simple, no depende de estado en el servidor y es el estándar actual
 * recomendado para cookies httpOnly + SPA.
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

export function requireCsrf(req: Request, res: Response, next: NextFunction): void {
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.header(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({ error: 'CSRF token inválido o ausente' });
    return;
  }
  next();
}
