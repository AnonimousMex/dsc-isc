import { describe, expect, it, vi } from 'vitest';
import {
  isDatabaseConnectionError,
  prismaDatasourceUrl,
  retryDatabaseRead,
} from './databaseConnection.js';
const unavailable = (code: string) => Object.assign(new Error('Database unavailable'), { code });

describe('Database connections', () => {
  it('limits the implicit Prisma pool while preserving connection parameters', () => {
    const url = new URL(
      prismaDatasourceUrl('postgresql://user:pass@pooler.example:5432/database?sslmode=require'),
    );
    expect(url.searchParams.get('connection_limit')).toBe('3');
    expect(url.searchParams.get('pool_timeout')).toBe('10');
    expect(url.searchParams.get('sslmode')).toBe('require');
    expect(url.username).toBe('user');
    expect(url.password).toBe('pass');
  });
  it('preserves an explicitly configured connection limit and timeout', () => {
    const url = new URL(
      prismaDatasourceUrl('postgresql://user:pass@host/db?connection_limit=2&pool_timeout=6'),
    );
    expect(url.searchParams.get('connection_limit')).toBe('2');
    expect(url.searchParams.get('pool_timeout')).toBe('6');
  });
  it('does not expose a malformed database URL in its error', () => {
    expect(() => prismaDatasourceUrl('invalid-credential-string')).toThrow(
      'DATABASE_URL no tiene un formato válido.',
    );
  });
  it('recovers a read after one dropped connection', async () => {
    const read = vi
      .fn()
      .mockRejectedValueOnce(unavailable('P1017'))
      .mockResolvedValueOnce({ id: 'user' });
    await expect(retryDatabaseRead(read)).resolves.toEqual({ id: 'user' });
    expect(read).toHaveBeenCalledTimes(2);
  });
  it('stops after a second transient failure', async () => {
    const error = unavailable('P2024');
    const read = vi.fn().mockRejectedValue(error);
    await expect(retryDatabaseRead(read)).rejects.toBe(error);
    expect(read).toHaveBeenCalledTimes(2);
  });
  it('does not retry invalid credentials or database constraints', async () => {
    const error = Object.assign(new Error('Invalid credentials'), { status: 401 });
    const read = vi.fn().mockRejectedValue(error);
    await expect(retryDatabaseRead(read)).rejects.toBe(error);
    expect(read).toHaveBeenCalledTimes(1);
    expect(isDatabaseConnectionError(unavailable('P2002'))).toBe(false);
    expect(
      isDatabaseConnectionError(new Error('FATAL: (EMAXCONNSESSION) max clients reached')),
    ).toBe(true);
  });
});
