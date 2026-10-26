import { beforeEach, describe, expect, it, vi } from 'vitest';
const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), update: vi.fn() },
  refreshToken: { create: vi.fn() },
}));
const passwords = vi.hoisted(() => ({ verifyPassword: vi.fn(), hashPassword: vi.fn() }));
vi.mock('../lib/prisma.js', () => ({ prisma: db }));
vi.mock('../lib/passwords.js', () => passwords);
vi.mock('../lib/env.js', () => ({ env: { isProduction: false, jwtSecret: 'test-only-secret' } }));
vi.mock('../lib/jwt.js', () => ({
  REFRESH_TOKEN_TTL_MS: 60000,
  signAccessToken: vi.fn(() => 'test-access'),
  signRefreshToken: vi.fn(() => 'test-refresh'),
  verifyRefreshToken: vi.fn(),
}));
vi.mock('../lib/mailer.js', () => ({ sendPasswordResetEmail: vi.fn() }));
import { login } from './authService.js';
const user = {
  id: 'test-user',
  email: 'user@example.test',
  name: 'Usuario de prueba',
  role: 'EDITOR',
  isActive: true,
  lockedUntil: null,
  totpSecret: null,
  passwordHash: 'test-hash',
  failedLoginAttempts: 0,
  mustChangePassword: false,
};
beforeEach(() => {
  vi.clearAllMocks();
  db.user.update.mockResolvedValue(user);
  db.refreshToken.create.mockResolvedValue({});
  passwords.verifyPassword.mockResolvedValue(true);
});
describe('Login after a transient connection failure', () => {
  it('retries only the user read and issues exactly one session', async () => {
    db.user.findUnique
      .mockRejectedValueOnce(Object.assign(new Error('Connection closed'), { code: 'P1017' }))
      .mockResolvedValueOnce(user);
    const result = await login(user.email, 'test-password');
    expect(result).toMatchObject({ user: { id: user.id }, accessToken: 'test-access' });
    expect(db.user.findUnique).toHaveBeenCalledTimes(2);
    expect(passwords.verifyPassword).toHaveBeenCalledTimes(1);
    expect(db.refreshToken.create).toHaveBeenCalledTimes(1);
    expect(db.user.update).toHaveBeenCalledTimes(1);
  });
  it('never issues a session or changes a password for incorrect credentials', async () => {
    db.user.findUnique.mockResolvedValue(user);
    passwords.verifyPassword.mockResolvedValue(false);
    await expect(login(user.email, 'wrong-password')).rejects.toMatchObject({ status: 401 });
    expect(db.refreshToken.create).not.toHaveBeenCalled();
    expect(passwords.hashPassword).not.toHaveBeenCalled();
  });
  it('keeps the second factor mandatory when already configured', async () => {
    db.user.findUnique.mockResolvedValue({ ...user, totpSecret: 'test-only-secret' });
    await expect(login(user.email, 'test-password')).rejects.toMatchObject({
      status: 401,
      message: 'Se requiere el código de doble factor',
    });
    expect(db.refreshToken.create).not.toHaveBeenCalled();
  });
});
