import { expect, test } from '@playwright/test';
const specialty = {
  id: 'cloud',
  slug: 'tecnologias-en-la-nube',
  name: 'Tecnologías en la Nube',
  description: 'Especialidad en servicios y aplicaciones.',
  image: null,
  reticulaUrl: 'https://institution.test/reticula.jpg',
  reticulaPdf: null,
};
const program = {
  id: 'isc',
  slug: 'isc',
  name: 'Ingeniería en Sistemas Computacionales',
  mission: '',
  vision: '',
  goals: '',
  admissionProfile: '',
  graduateProfile: [],
  actionField: '',
  videoUrl: null,
  reticulaPdf: null,
  reticulaImage: null,
};
const teacher = {
  id: 'teacher',
  slug: 'ana',
  fullName: 'Ana Profesora',
  title: 'Doctora',
  bio: 'Docente de sistemas.',
  experience: 'Desarrollo de sistemas.',
  photo: null,
  specialty: null,
  isActive: true,
  subjectIds: ['base', 'optional'],
};
const base = {
  id: 'base',
  code: 'AEB-1055',
  name: 'Programación Web',
  semester: 6,
  credits: 5,
  theoryHours: 1,
  practicalHours: 4,
  objective: 'Desarrollar aplicaciones web.',
  programId: 'isc',
  specialtyId: null,
  isElective: false,
  teacherIds: ['teacher'],
  prerequisiteIds: [],
  academicSourceUrl: 'https://institution.test/web.pdf',
  syllabus: null,
};
const optional = {
  ...base,
  id: 'optional',
  code: 'TNB-2304',
  name: 'Internet de Todas las Cosas',
  semester: 9,
  specialtyId: 'cloud',
  isElective: true,
  academicSourceUrl: 'https://institution.test/iot.pdf',
};
const integration = {
  ...optional,
  id: 'integration',
  code: 'TNB-2301',
  name: 'Integración Continua de Proyectos Web',
  semester: 7,
  isElective: false,
};
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const body =
      url.pathname === '/api/auth/me'
        ? {
            user: {
              id: 'admin',
              name: 'Admin',
              email: 'admin@example.test',
              role: 'SUPERADMIN',
              mustChangePassword: false,
            },
          }
        : url.pathname === '/api/programs/isc'
          ? program
          : url.pathname === '/api/programs'
            ? [program]
            : url.pathname === '/api/specialties/tecnologias-en-la-nube'
              ? specialty
              : url.pathname === '/api/specialties'
                ? [specialty]
                : url.pathname === '/api/subjects'
                  ? url.searchParams.has('specialtyId')
                    ? [integration, optional]
                    : [base, integration, optional]
                  : url.pathname === '/api/teachers/ana'
                    ? teacher
                    : url.pathname === '/api/teachers'
                      ? [teacher]
                      : [];
    await route.fulfill({ json: body });
  });
});
for (const width of [375, 1440]) {
  test(`retícula de especialidad, optativas y fuente individual (${width}px)`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://localhost:5185/especialidades/tecnologias-en-la-nube');
    await expect(page.getByRole('link', { name: 'Consultar retícula oficial' })).toHaveAttribute(
      'href',
      specialty.reticulaUrl,
    );
    await page.getByRole('tab', { name: 'Semestre 9' }).click();
    await page
      .locator('#reticula')
      .screenshot({ path: testInfo.outputPath('reticula-especialidad.png') });
    await expect(page.getByRole('button', { name: /Internet de Todas las Cosas/ })).toContainText(
      'Optativa',
    );
    await page.getByRole('button', { name: /Internet de Todas las Cosas/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Consultar fuente académica' })).toHaveAttribute(
      'href',
      optional.academicSourceUrl,
    );
    await page.getByRole('tab', { name: 'Docentes', exact: true }).click();
    await page.getByRole('link', { name: 'Ana Profesora' }).click();
    await expect(page.getByRole('heading', { name: 'Ana Profesora' })).toBeVisible();
    await page.getByRole('button', { name: /AEB-1055/ }).click();
    await expect(page.getByRole('dialog')).toContainText(base.name);
    await expect(page.getByRole('link', { name: 'Consultar fuente académica' })).toHaveAttribute(
      'href',
      base.academicSourceUrl,
    );
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    ).toBe(false);
  });
}
test('la retícula de la carrera conserva solamente las materias genéricas', async ({ page }) => {
  await page.goto('http://localhost:5185/oferta-educativa/isc#reticula');
  await expect(page.getByRole('tab', { name: 'Semestre 6' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Semestre 7' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /AEB-1055/ })).toBeVisible();
  await page.locator('#reticula').getByRole('link', { name: 'Ver especialidades' }).click();
  await expect(page).toHaveURL('http://localhost:5185/especialidades');
  await expect(page.getByRole('link', { name: /Tecnologías en la Nube/ })).toBeVisible();
});
test('el administrador asigna la especialidad y guarda un PDF con prioridad sobre el enlace', async ({
  page,
}) => {
  let saved: Record<string, unknown> | undefined;
  await page.route('**/api/media/upload', async (route) => {
    expect(route.request().postDataBuffer()!.toString()).toContain('nuevo-plan.pdf');
    await route.fulfill({ json: { id: 'new-pdf', url: 'https://institution.test/nuevo.pdf' } });
  });
  await page.route('**/api/subjects/base', async (route) => {
    saved = route.request().postDataJSON();
    await route.fulfill({ json: { ...base, ...saved } });
  });
  await page.goto('http://localhost:5186/materias');
  await page
    .getByRole('row')
    .filter({ hasText: 'AEB-1055' })
    .getByRole('button', { name: 'Editar', exact: true })
    .click();
  await page
    .getByLabel('Enlace al plan de estudios de esta materia')
    .fill('https://institution.test/actualizado.pdf');
  await page.getByLabel('Retícula de especialidad').selectOption('cloud');
  await page.getByLabel('Materia optativa').check();
  await page.getByLabel('Plan de estudios de la materia (PDF): subir archivo').setInputFiles({
    name: 'nuevo-plan.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 test'),
  });
  await expect(page.getByText('https://institution.test/nuevo.pdf', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(saved).toMatchObject({
    academicSourceUrl: 'https://institution.test/actualizado.pdf',
    syllabusMediaId: 'new-pdf',
    specialtyId: 'cloud',
    isElective: true,
  });
  await page.route('**/api/subjects', (route) =>
    route.fulfill({
      json: [
        { ...optional, syllabus: { id: 'new-pdf', url: 'https://institution.test/nuevo.pdf' } },
      ],
    }),
  );
  await page.goto('http://localhost:5185/docentes/ana');
  await page.getByRole('button', { name: /TNB-2304/ }).click();
  await expect(page.getByRole('link', { name: 'Consultar fuente académica' })).toHaveAttribute(
    'href',
    'https://institution.test/nuevo.pdf',
  );
});
test('el administrador edita el enlace de la retícula de especialidad', async ({ page }) => {
  let saved: Record<string, unknown> | undefined;
  await page.route('**/api/specialties/cloud', async (route) => {
    saved = route.request().postDataJSON();
    await route.fulfill({ json: { ...specialty, ...saved } });
  });
  await page.goto('http://localhost:5186/especialidades');
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  await page
    .getByLabel('Enlace a la retícula oficial')
    .fill('https://institution.test/nueva-reticula.pdf');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(saved).toMatchObject({
    reticulaUrl: 'https://institution.test/nueva-reticula.pdf',
    reticulaPdfId: null,
  });
});
