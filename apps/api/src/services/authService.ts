import { createHash, randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword } from '../lib/passwords.js';
import {
  REFRESH_TOKEN_TTL_MS,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../lib/jwt.js';
import { generateTotpSecret, getTotpProvisioningUri, verifyTotpCode } from '../lib/totp.js';
import { env } from '../lib/env.js';
import { HttpError } from '../middleware/errorHandler.js';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const TOTP_SETUP_TOKEN_TTL = '10m';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; email: string; role: string; mustChangePassword: boolean };
}

export interface TotpSetupRequired {
  requiresTotpSetup: true;
  setupToken: string;
  otpauthUrl: string;
}

async function registerFailedAttempt(userId: string, currentAttempts: number) {
  const attempts = currentAttempts + 1;
  const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: shouldLock ? 0 : attempts,
      lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null,
    },
  });
}

export async function login(
  email: string,
  password: string,
  totpCode?: string,
): Promise<LoginResult | TotpSetupRequired> {
  const user = await prisma.user.findUnique({ where: { email } });
  const invalidCredentials = () => new HttpError(401, 'Correo o contraseña incorrectos');

  if (!user || !user.isActive) {
    throw invalidCredentials();
  }

  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    throw new HttpError(423, `Cuenta bloqueada temporalmente. Intenta de nuevo en ${minutes} min.`);
  }

  const passwordOk = await verifyPassword(password, user.passwordHash);
  if (!passwordOk) {
    await registerFailedAttempt(user.id, user.failedLoginAttempts);
    throw invalidCredentials();
  }

  // 2FA obligatorio para SUPERADMIN (sección 9). Si aún no lo configuró,
  // se le pide completar el enrolamiento antes de abrir sesión.
  if (user.role === 'SUPERADMIN' && !user.totpSecret) {
    const secret = generateTotpSecret();
    await prisma.user.update({ where: { id: user.id }, data: { totpSecret: secret } });
    const setupToken = jwt.sign({ sub: user.id, purpose: 'totp-setup' }, env.jwtSecret, {
      expiresIn: TOTP_SETUP_TOKEN_TTL,
    });
    return {
      requiresTotpSetup: true,
      setupToken,
      otpauthUrl: getTotpProvisioningUri(user.email, secret),
    };
  }

  if (user.totpSecret) {
    if (!totpCode) {
      throw new HttpError(401, 'Se requiere el código de doble factor');
    }
    if (!(await verifyTotpCode(user.totpSecret, totpCode))) {
      await registerFailedAttempt(user.id, user.failedLoginAttempts);
      throw new HttpError(401, 'Código de doble factor inválido');
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });

  const { accessToken, refreshToken } = await issueTokenPair(user.id, user.role, user.email);
  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
  };
}

export async function confirmTotpSetup(setupToken: string, code: string): Promise<LoginResult> {
  let payload: { sub: string; purpose: string };
  try {
    payload = jwt.verify(setupToken, env.jwtSecret) as { sub: string; purpose: string };
  } catch {
    throw new HttpError(401, 'El enlace de configuración expiró, inicia sesión de nuevo');
  }
  if (payload.purpose !== 'totp-setup') {
    throw new HttpError(400, 'Token de configuración inválido');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.totpSecret) {
    throw new HttpError(400, 'No hay una configuración de doble factor pendiente');
  }
  if (!(await verifyTotpCode(user.totpSecret, code))) {
    throw new HttpError(401, 'Código de doble factor inválido');
  }

  const { accessToken, refreshToken } = await issueTokenPair(user.id, user.role, user.email);
  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
  };
}

async function issueTokenPair(userId: string, role: string, email: string) {
  const jti = randomUUID();
  const refreshToken = signRefreshToken({ sub: userId, jti });
  await prisma.refreshToken.create({
    data: {
      id: jti,
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });
  const accessToken = signAccessToken({ sub: userId, role, email });
  return { accessToken, refreshToken };
}

export async function refreshSession(refreshToken: string): Promise<LoginResult> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new HttpError(401, 'Sesión expirada, inicia sesión de nuevo');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { id: payload.jti } });
  if (!stored || stored.tokenHash !== hashToken(refreshToken)) {
    throw new HttpError(401, 'Sesión inválida, inicia sesión de nuevo');
  }
  if (stored.revokedAt) {
    // Reuso de un refresh token ya rotado: posible robo de token — se
    // revocan todas las sesiones activas del usuario por precaución.
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new HttpError(401, 'Sesión inválida, inicia sesión de nuevo');
  }
  if (stored.expiresAt.getTime() < Date.now()) {
    throw new HttpError(401, 'Sesión expirada, inicia sesión de nuevo');
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user || !user.isActive) {
    throw new HttpError(401, 'Sesión inválida, inicia sesión de nuevo');
  }

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
  const { accessToken, refreshToken: newRefreshToken } = await issueTokenPair(
    user.id,
    user.role,
    user.email,
  );

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
  };
}

export async function logout(refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) return;
  try {
    const payload = verifyRefreshToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { id: payload.jti, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  } catch {
    // Token ya inválido/expirado: no hay nada que revocar.
  }
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new HttpError(404, 'Usuario no encontrado');

  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) throw new HttpError(401, 'La contraseña actual no es correcta');

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, mustChangePassword: false },
  });
  // Cambiar contraseña cierra el resto de sesiones activas por seguridad.
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
