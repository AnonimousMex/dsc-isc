import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../lib/jwt.js';

export interface AuthenticatedUser {
  id: string;
  role: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const ACCESS_TOKEN_COOKIE = 'accessToken';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
  if (!token) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch {
    res.status(401).json({ error: 'Sesión inválida o expirada' });
  }
}

export const ACCESS_TOKEN_COOKIE_NAME = ACCESS_TOKEN_COOKIE;

/**
 * Igual que requireAuth pero nunca rechaza la petición: solo adjunta
 * req.user si hay una sesión válida. Se usa en los listados públicos que
 * el sitio y el sistema comparten (ej. noticias: el sitio solo ve las
 * publicadas, el sistema autenticado ve también los borradores).
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
  if (token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub, role: payload.role, email: payload.email };
    } catch {
      // Token inválido/expirado: se trata como visitante anónimo.
    }
  }
  next();
}
