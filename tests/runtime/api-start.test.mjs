import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

test('shared exports JavaScript that Node can import without a TypeScript loader', async () => {
  assert.match(import.meta.resolve('@dsc-isc/shared'), /\/dist\/index\.js$/);
  const shared = await import('@dsc-isc/shared');
  assert.equal(typeof shared.graduateRegistrationSchema.parse, 'function');
  const preset = await import('@dsc-isc/shared/tailwind-preset');
  assert.ok(preset.default.theme);
});

test('compiled API starts with plain Node and responds to health checks', { timeout: 20_000 }, async (t) => {
  const reservation = net.createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const { port } = reservation.address();
  await new Promise((resolve, reject) => reservation.close((error) => error ? reject(error) : resolve()));

  // Never load the developer's .env or connect to the real database.
  const child = spawn(process.execPath, ['dist/server.js'], {
    cwd: fileURLToPath(new URL('../../apps/api/', import.meta.url)),
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: String(port),
      DOTENV_CONFIG_PATH: fileURLToPath(new URL('./unused.env', import.meta.url)),
      DATABASE_URL: 'postgresql://unused:unused@127.0.0.1:1/unused?connect_timeout=1',
      JWT_SECRET: 'runtime-test-access-secret',
      JWT_REFRESH_SECRET: 'runtime-test-refresh-secret',
      STORAGE_DRIVER: 'local',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.on('data', (chunk) => { output += chunk; });
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = once(child, 'exit');
      child.kill();
      await exited;
    }
  });

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`API did not start:\n${output}`)), 15_000);
    const ready = (chunk) => {
      if (chunk.toString().includes('[api] escuchando')) {
        clearTimeout(timer);
        resolve();
      }
    };
    child.stdout.on('data', ready);
    child.once('error', (error) => { clearTimeout(timer); reject(error); });
    child.once('exit', (code) => { clearTimeout(timer); reject(new Error(`API exited (${code}):\n${output}`)); });
  });
  const response = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(5000) });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', service: 'dsc-isc-api' });
});
