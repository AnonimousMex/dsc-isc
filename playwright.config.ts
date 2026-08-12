import { defineConfig } from '@playwright/test';

/**
 * Suite e2e (sección 12 del documento de producto): login y un CRUD
 * completo de docente (crear desde admin → verlo en /docentes de web →
 * editarlo → verificar el cambio → borrarlo). `globalSetup` deja la base
 * de datos en un estado limpio y conocido antes de correr las pruebas.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm run dev -w apps/api',
      url: 'http://localhost:4000/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: 'npm run dev -w apps/web',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: 'npm run dev -w apps/admin',
      url: 'http://localhost:5174',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
