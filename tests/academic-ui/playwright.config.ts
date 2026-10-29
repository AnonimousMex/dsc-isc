import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';
const cwd = fileURLToPath(new URL('../../', import.meta.url));
export default defineConfig({
  testDir: '.',
  testMatch: 'academic.spec.ts',
  workers: 1,
  timeout: 30_000,
  reporter: 'list',
  use: { headless: true, trace: 'retain-on-failure' },
  // Intercepted API only; this suite never runs a seed or writes to a real database.
  webServer: [
    {
      command: 'node ../../node_modules/vite/bin/vite.js --port 5185 --strictPort',
      cwd: `${cwd}/apps/web`,
      url: 'http://localhost:5185',
      reuseExistingServer: false,
      env: { VITE_API_URL: 'http://localhost:4000' },
    },
    {
      command: 'node ../../node_modules/vite/bin/vite.js --port 5186 --strictPort',
      cwd: `${cwd}/apps/admin`,
      url: 'http://localhost:5186',
      reuseExistingServer: false,
      env: { VITE_API_URL: 'http://localhost:4000' },
    },
  ],
});
