import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { writeFileSync } from 'node:fs';

const apiDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../apps/api');
export const CREDENTIALS_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '.seed-credentials.json',
);

/**
 * Corre el seed real de Prisma (el mismo que usa cualquier desarrollador,
 * ver apps/api/prisma/seed.ts) para dejar la base de datos en un estado
 * limpio y conocido antes de la suite, y captura la contraseña generada
 * del SUPERADMIN (se imprime una sola vez por consola) para que las
 * pruebas puedan iniciar sesión.
 */
export default function globalSetup(): void {
  const output = execFileSync('npx', ['tsx', 'prisma/seed.ts'], {
    cwd: apiDir,
    encoding: 'utf-8',
  });

  const match = output.match(/password:\s+(\S+)/);
  if (!match) {
    throw new Error('No se pudo leer la contraseña generada por el seed en la salida del comando.');
  }

  writeFileSync(CREDENTIALS_PATH, JSON.stringify({ email: 'admin@dsc.local', password: match[1] }));
}
