import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('../../', import.meta.url));

// Suite aislada: no API real, no globalSetup ni seed destructivo.
export default defineConfig({
  testDir: '.',
  testMatch: 'graduates.spec.ts',
  workers: 1,
  timeout: 30_000,
  reporter: 'list',
  use: { headless: true, trace: 'retain-on-failure' },
  webServer: [
    { command: 'node ../../node_modules/vite/bin/vite.js --port 5183 --strictPort', cwd: `${cwd}/apps/web`, url: 'http://localhost:5183', reuseExistingServer: false, env: { VITE_API_URL: 'http://localhost:4000' } },
    { command: 'node ../../node_modules/vite/bin/vite.js --port 5184 --strictPort', cwd: `${cwd}/apps/admin`, url: 'http://localhost:5184', reuseExistingServer: false, env: { VITE_API_URL: 'http://localhost:4000' } },
  ],
});
