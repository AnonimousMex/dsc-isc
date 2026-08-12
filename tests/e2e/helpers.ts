import { readFileSync, writeFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';
import { generate } from 'otplib';
import type { Page } from '@playwright/test';
import { CREDENTIALS_PATH } from './global-setup';

export const ADMIN_URL = 'http://localhost:5174';
export const WEB_URL = 'http://localhost:5173';

interface Credentials {
  email: string;
  password: string;
}

/** Contraseña usada por las pruebas al completar el cambio obligatorio del primer login. */
const E2E_PASSWORD = 'ClaveDePruebaE2E123';

function readCredentials(): Credentials {
  return JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf-8'));
}

function writeCredentials(credentials: Credentials): void {
  writeFileSync(CREDENTIALS_PATH, JSON.stringify(credentials));
}

async function getTotpCodeFor(email: string): Promise<string> {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    if (!user.totpSecret) throw new Error(`El usuario ${email} todavía no tiene 2FA configurado`);
    return await generate({ secret: user.totpSecret });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Inicia sesión en apps/admin manejando cualquiera de los tres estados
 * posibles de la cuenta SUPERADMIN sembrada: enrolamiento de 2FA
 * pendiente, cambio de contraseña obligatorio, o sesión ya completamente
 * configurada. Es idempotente entre specs: si un archivo de prueba ya
 * cambió la contraseña, actualiza el fixture compartido para que el
 * siguiente spec la reutilice.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  const credentials = readCredentials();
  let { password } = credentials;
  const { email } = credentials;

  await page.goto(`${ADMIN_URL}/login`);
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type=submit]');
  await page.waitForTimeout(500);

  if ((await page.locator('#totp-setup-code').count()) > 0) {
    const code = await getTotpCodeFor(email);
    await page.fill('#totp-setup-code', code);
    await page.click('button[type=submit]');
    await page.waitForTimeout(500);
  } else if ((await page.locator('#totp').count()) > 0) {
    const code = await getTotpCodeFor(email);
    await page.fill('#totp', code);
    await page.click('button[type=submit]');
    await page.waitForTimeout(500);
  }

  if (page.url().includes('cambiar-contrasena')) {
    await page.fill('#current', password);
    await page.fill('#new', E2E_PASSWORD);
    await page.fill('#confirm', E2E_PASSWORD);
    await page.click('button[type=submit]');
    await page.waitForTimeout(500);

    password = E2E_PASSWORD;
    writeCredentials({ email, password });

    await page.goto(`${ADMIN_URL}/login`);
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('button[type=submit]');
    await page.waitForTimeout(500);
    if ((await page.locator('#totp').count()) > 0) {
      const code = await getTotpCodeFor(email);
      await page.fill('#totp', code);
      await page.click('button[type=submit]');
      await page.waitForTimeout(500);
    }
  }
}
