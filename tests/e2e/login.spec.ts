import { expect, test } from '@playwright/test';
import { ADMIN_URL, loginAsAdmin } from './helpers';

test.describe('Login del sistema', () => {
  test('bloquea el acceso a rutas protegidas sin sesión', async ({ page }) => {
    await page.goto(ADMIN_URL + '/');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('rechaza credenciales incorrectas con un mensaje claro', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/login`);
    await page.fill('#email', 'admin@dsc.local');
    await page.fill('#password', 'contraseña-incorrecta');
    await page.click('button[type=submit]');

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('inicia sesión completando 2FA / cambio de contraseña según haga falta, y llega al dashboard', async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await expect(page).toHaveURL(`${ADMIN_URL}/`);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('SUPERADMIN')).toBeVisible();
  });

  test('cerrar sesión vuelve a bloquear las rutas protegidas', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.click('text=Cerrar sesión');
    await expect(page).toHaveURL(/\/login$/);

    await page.goto(ADMIN_URL + '/');
    await expect(page).toHaveURL(/\/login$/);
  });
});
