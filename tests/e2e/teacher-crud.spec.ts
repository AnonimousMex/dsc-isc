import { expect, test } from '@playwright/test';
import { ADMIN_URL, WEB_URL, loginAsAdmin } from './helpers';

const FULL_NAME = 'Docente Prueba E2E';
const UPDATED_TITLE = 'M.C. en Pruebas Automatizadas (editado)';

/**
 * Cubre el punto de aceptación del documento de producto: "Se puede dar de
 * alta un docente nuevo (foto o link, video de YouTube, materias que
 * imparte) desde admin y aparece de inmediato en /docentes de web" — y el
 * flujo completo de la sección 12: crear → ver en el sitio → editar →
 * verificar el cambio → borrar.
 */
test.describe('CRUD completo de un docente (admin ↔ sitio público)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('crear, publicar, editar y borrar un docente', async ({ page }) => {
    await test.step('crear el docente desde el admin', async () => {
      await page.goto(`${ADMIN_URL}/docentes`);
      await page.click('text=Nuevo docente');

      const dialog = page.locator('[role=dialog]');
      await dialog.locator('#fullName').fill(FULL_NAME);
      await dialog.locator('#title').fill('M.C. en Pruebas Automatizadas');
      await dialog.locator('#bio').fill('Biografía de prueba generada por la suite e2e.');
      await dialog.locator('#experience').fill('Experiencia de prueba generada por la suite e2e.');
      await dialog.locator('#youtubeUrl').fill('https://www.youtube.com/embed/dQw4w9WgXcQ');

      await dialog.locator('button:has-text("Guardar")').click();
      await expect(dialog).toBeHidden();
      await expect(page.getByText(FULL_NAME)).toBeVisible();
    });

    await test.step('aparece de inmediato en /docentes del sitio público', async () => {
      await page.goto(`${WEB_URL}/docentes`);
      await expect(page.getByText(FULL_NAME)).toBeVisible();
      await page.getByText(FULL_NAME).click();
      await expect(page).toHaveURL(/\/docentes\//);
      await expect(page.getByRole('heading', { name: FULL_NAME })).toBeVisible();
      // El botón de reproducir video solo aparece si youtubeUrl está configurado.
      await expect(page.getByRole('button', { name: /Reproducir video/ })).toBeVisible();
    });

    await test.step('editarlo desde el admin', async () => {
      await page.goto(`${ADMIN_URL}/docentes`);
      await page.locator(`tr:has-text("${FULL_NAME}") >> text=Editar`).click();

      const dialog = page.locator('[role=dialog]');
      await expect(dialog.locator('#fullName')).toHaveValue(FULL_NAME);
      await dialog.locator('#title').fill(UPDATED_TITLE);
      await dialog.locator('button:has-text("Guardar")').click();
      await expect(dialog).toBeHidden();
    });

    await test.step('el cambio se refleja en el sitio público', async () => {
      await page.goto(`${WEB_URL}/docentes`);
      await expect(page.getByText(UPDATED_TITLE)).toBeVisible();
    });

    await test.step('borrarlo desde el admin', async () => {
      await page.goto(`${ADMIN_URL}/docentes`);
      await page.locator(`tr:has-text("${FULL_NAME}") >> text=Eliminar`).click();
      await page.locator('[role=dialog] button:has-text("Eliminar")').click();
      await expect(page.getByText(FULL_NAME)).toHaveCount(0);
    });

    await test.step('desaparece del sitio público', async () => {
      await page.goto(`${WEB_URL}/docentes`);
      await expect(page.getByText(FULL_NAME)).toHaveCount(0);
    });
  });
});
