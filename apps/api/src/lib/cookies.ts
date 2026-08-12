import type { Response } from 'express';
import { env } from './env.js';
import { CSRF_COOKIE_NAME, generateCsrfToken } from './csrf.js';
import { REFRESH_TOKEN_TTL_MS } from './jwt.js';

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

const baseCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'strict' as const,
  path: '/',
};

export function setSessionCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
  res.cookie('accessToken', tokens.accessToken, { ...baseCookieOptions, maxAge: ACCESS_TOKEN_TTL_MS });
  res.cookie('refreshToken', tokens.refreshToken, {
    ...baseCookieOptions,
    maxAge: REFRESH_TOKEN_TTL_MS,
    path: '/api/auth', // solo se envía a las rutas que lo necesitan
  });
  // Cookie CSRF: NO httpOnly a propósito (ver src/lib/csrf.ts), el cliente
  // debe poder leerla para reenviarla en el header X-CSRF-Token.
  res.cookie(CSRF_COOKIE_NAME, generateCsrfToken(), {
    httpOnly: false,
    secure: env.isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: REFRESH_TOKEN_TTL_MS,
  });
}

export function clearSessionCookies(res: Response) {
  res.clearCookie('accessToken', { ...baseCookieOptions });
  res.clearCookie('refreshToken', { ...baseCookieOptions, path: '/api/auth' });
  res.clearCookie(CSRF_COOKIE_NAME, { path: '/' });
}
