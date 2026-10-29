import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';
const cwd = fileURLToPath(new URL('../../apps/web', import.meta.url));
export default defineConfig({
  testDir: '.',
  testMatch: 'motion.spec.ts',
  workers: 1,
  timeout: 30_000,
  reporter: 'list',
  use: { headless: true, trace: 'retain-on-failure' },
  webServer: {
    command: 'node ../../node_modules/vite/bin/vite.js --port 5187 --strictPort',
    cwd,
    url: 'http://localhost:5187',
    reuseExistingServer: false,
    env: { VITE_API_URL: 'http://localhost:4000' },
  },
});
