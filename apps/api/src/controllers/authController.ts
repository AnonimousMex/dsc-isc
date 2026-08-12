import type { Request, Response } from 'express';
import { changePasswordSchema, loginSchema, totpConfirmSchema } from '@dsc-isc/shared';
import { asyncHandler } from '../lib/asyncHandler.js';
import { clearSessionCookies, setSessionCookies } from '../lib/cookies.js';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';
import * as authService from '../services/authService.js';

export const postLogin = asyncHandler(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input.email, input.password, input.totpCode);

  if ('requiresTotpSetup' in result) {
    res.status(200).json(result);
    return;
  }

  setSessionCookies(res, result);
  res.json({ user: result.user });
});

export const postTotpConfirm = asyncHandler(async (req: Request, res: Response) => {
  const input = totpConfirmSchema.parse(req.body);
  const result = await authService.confirmTotpSetup(input.setupToken, input.code);
  setSessionCookies(res, result);
  res.json({ user: result.user });
});

export const postRefresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    res.status(401).json({ error: 'No hay sesión activa' });
    return;
  }
  const result = await authService.refreshSession(refreshToken);
  setSessionCookies(res, result);
  res.json({ user: result.user });
});

export const postLogout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.cookies?.refreshToken);
  clearSessionCookies(res);
  res.status(204).send();
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) throw new HttpError(401, 'Sesión inválida');
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
  });
});

export const postChangePassword = asyncHandler(async (req: Request, res: Response) => {
  const input = changePasswordSchema.parse(req.body);
  await authService.changePassword(req.user!.id, input.currentPassword, input.newPassword);
  clearSessionCookies(res);
  res.status(204).send();
});
