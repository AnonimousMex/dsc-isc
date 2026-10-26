import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
vi.mock('../lib/env.js', () => ({ env: { isProduction: false } }));
import { errorHandler, HttpError } from './errorHandler.js';
afterEach(() => vi.restoreAllMocks());
function response() {
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn(), setHeader: vi.fn() };
  return res;
}
describe('Authentication database errors', () => {
  it('returns a temporary unavailability response without driver details', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = response();
    errorHandler(
      Object.assign(new Error('Internal database details'), { code: 'P2024' }),
      {} as Request,
      res as unknown as Response,
      vi.fn(),
    );
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '5');
    const body = res.json.mock.calls[0]![0];
    expect(body.error).toContain('intenta de nuevo');
    expect(body).not.toHaveProperty('detail');
  });
  it('continues to reject invalid credentials with 401', () => {
    const res = response();
    errorHandler(
      new HttpError(401, 'Correo o contraseña incorrectos'),
      {} as Request,
      res as unknown as Response,
      vi.fn(),
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Correo o contraseña incorrectos' });
  });
});
