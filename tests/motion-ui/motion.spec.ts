import { expect, test, type Page } from '@playwright/test';

async function canvasFrame(page: Page) {
  return page
    .locator('.ambient-network')
    .evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', (route) => route.fulfill({ json: [] }));
});

test('permite activar las animaciones con movimiento reducido y conserva la elección al recargar', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://localhost:5187');
  const root = page.locator('.experience-root');
  const button = page.locator('.motion-toggle');
  await expect(root).toHaveAttribute('data-motion', 'paused');
  await expect(button).toBeEnabled();
  await expect(button).toHaveText('Activar movimiento');
  await button.click();
  await expect(root).toHaveAttribute('data-motion', 'playing');
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'playing');
  // Verify that the drawing and CSS animations actually resume, beyond the label.
  const before = await canvasFrame(page);
  await expect.poll(() => canvasFrame(page)).not.toBe(before);
  const logo = page.locator('.logo-trace').first();
  await expect(logo).toHaveCSS('animation-play-state', 'running');
  expect(
    await logo.evaluate((node) => parseFloat(getComputedStyle(node).animationDuration)),
  ).toBeGreaterThan(1);
  await page.reload();
  await expect(root).toHaveAttribute('data-motion', 'playing');
  await expect(button).toHaveText('Pausar movimiento');
  await button.click();
  await expect(root).toHaveAttribute('data-motion', 'paused');
  await expect(logo).toHaveCSS('animation-play-state', 'paused');
  const paused = await canvasFrame(page);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  expect(await canvasFrame(page)).toBe(paused);
  await page.reload();
  await expect(root).toHaveAttribute('data-motion', 'paused');
  await expect(button).toHaveAttribute('aria-pressed', 'false');
});

test('sigue los cambios del dispositivo hasta que el usuario elige su preferencia', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('http://localhost:5187');
  const root = page.locator('.experience-root');
  await expect(root).toHaveAttribute('data-motion', 'playing');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(root).toHaveAttribute('data-motion', 'paused');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(root).toHaveAttribute('data-motion', 'playing');
  await page.locator('.motion-toggle').click();
  await expect(root).toHaveAttribute('data-motion', 'paused');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(root).toHaveAttribute('data-motion', 'paused');
});

test('explica cuando las animaciones están desactivadas por el administrador', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('isc:motion', 'playing'));
  await page.route('**/api/site-config', (route) =>
    route.fulfill({
      json: [{ key: 'site.presentation', value: { motion: { enabled: false } }, updatedAt: '' }],
    }),
  );
  await page.goto('http://localhost:5187');
  await expect(page.locator('.experience-root')).toHaveAttribute('data-motion', 'paused');
  await expect(page.locator('.motion-toggle')).toBeDisabled();
  await expect(page.locator('.motion-toggle')).toHaveText('Movimiento desactivado');
  await expect(page.locator('.motion-toggle')).toHaveAttribute('title', /configuración del portal/);
});

test('permite alternar movimiento aunque el navegador bloquee el almacenamiento', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error('Storage blocked');
    };
    Storage.prototype.setItem = () => {
      throw new Error('Storage blocked');
    };
  });
  await page.goto('http://localhost:5187');
  const root = page.locator('.experience-root');
  await expect(root).toHaveAttribute('data-motion', 'paused');
  await page.locator('.motion-toggle').click();
  await expect(root).toHaveAttribute('data-motion', 'playing');
  await page.locator('.motion-toggle').click();
  await expect(root).toHaveAttribute('data-motion', 'paused');
});
