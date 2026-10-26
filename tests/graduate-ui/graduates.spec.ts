import { expect, test } from '@playwright/test';

const graduate = {
  id: 'graduate1', fullName: 'María Pérez', headline: 'Ingeniera de software', graduationYear: 2020,
  bio: 'Desarrollo aplicaciones para mejorar la comunidad.', experience: 'Cinco años desarrollando aplicaciones.',
  city: 'Morelia', email: null, website: null, linkedin: 'https://www.linkedin.com/in/maria', github: null, facebook: null, instagram: null,
  photoUrl: null, curriculumUrl: 'http://localhost:4000/api/graduates/graduate1/files/curriculum',
};
const application = { ...graduate, email: 'maria@example.com', status: 'PENDING', reviewNote: null, reviewedAt: null, createdAt: '2026-10-06T18:00:00Z', diplomaUrl: 'http://localhost:4000/api/graduates/admin/graduate1/files/diploma' };

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    const body = path === '/api/auth/me' ? { user: { id: 'admin1', name: 'Administrador', email: 'admin@example.com', role: 'SUPERADMIN', mustChangePassword: false } }
      : path === '/api/graduates/admin/applications' ? [application]
      : path === '/api/graduates/graduate1' ? graduate
      : path === '/api/graduates' ? [graduate] : [];
    await route.fulfill({ json: body });
  });
});

test('permite alternar vistas y conserva la preferencia al recargar', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:5183/egresados');
  await page.getByRole('button', { name: 'Mosaico', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Mosaico', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Mosaico', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Galería', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Galería', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText(graduate.bio)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
});

test('edita un egresado aprobado y envía la foto con sus datos', async ({ page }) => {
  let saved = false;
  await page.route('**/api/graduates/admin/applications', (route) => route.fulfill({ json: [{ ...application, status: 'APPROVED', showEmail: false, fullName: saved ? 'Nombre actualizado' : graduate.fullName }] }));
  await page.route('**/api/graduates/admin/graduate1', async (route) => {
    expect(route.request().method()).toBe('PUT');
    const body = route.request().postDataBuffer()!.toString();
    expect(body).toContain('Nombre actualizado');
    expect(body).toContain('foto.png');
    expect(body).toContain('"showEmail":true');
    expect(body).not.toContain('name="diploma"');
    saved = true;
    await route.fulfill({ status: 204 });
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:5184/egresados');
  await page.getByRole('button', { name: /^Aprobado/ }).click();
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  await page.getByLabel('Nombre completo').fill('Nombre actualizado');
  await page.getByLabel('Foto (JPG').setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: Buffer.from('test image') });
  await expect(page.getByRole('img', { name: 'Vista previa de la foto' })).toBeVisible();
  await page.getByLabel('Mostrar correo en el perfil público').check();
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText('Nombre actualizado')).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('Perfil actualizado.');
});

test('directorio y detalle muestran el perfil aprobado y su currículum', async ({ page }) => {
  await page.goto('http://localhost:5183/egresados');
  await expect(page.getByRole('heading', { name: 'Soy un egresado' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Buscar egresados' }).fill('no existe');
  await expect(page.getByText('No hay perfiles que coincidan')).toBeVisible();
  await page.getByRole('searchbox', { name: 'Buscar egresados' }).fill('María');
  await page.getByRole('link', { name: /María Pérez/ }).click();
  await expect(page.getByRole('heading', { name: 'María Pérez' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Descargar currículum' })).toHaveAttribute('href', graduate.curriculumUrl);
  await expect(page.getByRole('link', { name: 'Correo', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /título para verificar/ })).toHaveCount(0);
});

test('envía el registro con título y comunica que está pendiente', async ({ page }) => {
  await page.route('**/api/graduates/register', async (route) => {
    expect(route.request().headers()['content-type']).toContain('multipart/form-data');
    expect(route.request().postDataBuffer()?.toString()).toContain('titulo.pdf');
    await route.fulfill({ status: 201, json: { message: 'Tu perfil aparecerá después de verificar tu título.' } });
  });
  await page.goto('http://localhost:5183/egresados/registro');
  await page.getByLabel('Nombre completo').fill('María Pérez');
  await page.getByRole('textbox', { name: 'Correo de contacto *', exact: true }).fill('maria@example.com');
  await page.getByLabel('Profesión o puesto actual').fill('Ingeniera de software');
  await page.getByLabel('Sobre mí').fill(graduate.bio);
  await page.getByLabel('Título profesional').setInputFiles({ name: 'titulo.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7') });
  await page.getByRole('checkbox', { name: /Confirmo que soy egresado/ }).check();
  await page.getByRole('button', { name: 'Enviar para verificación' }).click();
  await expect(page.getByRole('heading', { name: 'Solicitud enviada' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('después de verificar tu título');
});

test('el administrador revisa el título y confirma antes de aprobar', async ({ page }) => {
  await page.route('**/api/graduates/admin/graduate1/review', async (route) => {
    expect(route.request().postDataJSON()).toMatchObject({ status: 'APPROVED', titleVerified: true });
    await route.fulfill({ status: 204 });
  });
  await page.goto('http://localhost:5184/egresados');
  await page.getByRole('button', { name: 'Revisar solicitud' }).click();
  await expect(page.getByRole('link', { name: 'Descargar título para verificar' })).toHaveAttribute('href', application.diplomaUrl);
  await expect(page.getByRole('button', { name: 'Aprobar y publicar' })).toBeDisabled();
  await page.getByRole('checkbox', { name: /Verifiqué que el título/ }).check();
  await page.getByRole('button', { name: 'Aprobar y publicar' }).click();
  await expect(page.getByRole('status')).toHaveText('Perfil aprobado y publicado.');
});

test('formulario móvil cabe en la pantalla', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:5183/egresados/registro');
  await expect(page.getByRole('heading', { name: 'Comparte tu trayectoria' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});
