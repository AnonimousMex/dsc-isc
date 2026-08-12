import type { Role, User, UserCreateInput, UserUpdateInput } from '@dsc-isc/shared';
import { prisma } from '../lib/prisma.js';
import { hashPassword } from '../lib/passwords.js';
import { HttpError } from '../middleware/errorHandler.js';

function toDto(row: {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  totpSecret: string | null;
  createdAt: Date;
}): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as Role,
    isActive: row.isActive,
    has2fa: Boolean(row.totpSecret),
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listUsers(): Promise<User[]> {
  const rows = await prisma.user.findMany({ orderBy: { name: 'asc' } });
  return rows.map(toDto);
}

export async function getUserById(id: string): Promise<User> {
  const row = await prisma.user.findUnique({ where: { id } });
  if (!row) throw new HttpError(404, 'Usuario no encontrado');
  return toDto(row);
}

export async function createUser(input: UserCreateInput): Promise<User> {
  const passwordHash = await hashPassword(input.password);
  const row = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      mustChangePassword: true,
    },
  });
  return toDto(row);
}

export async function updateUser(id: string, input: UserUpdateInput): Promise<User> {
  const data: Record<string, unknown> = {
    name: input.name,
    email: input.email,
    role: input.role,
  };
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.password) {
    data.passwordHash = await hashPassword(input.password);
    data.mustChangePassword = true;
  }
  const row = await prisma.user.update({ where: { id }, data });
  if (input.isActive === false) {
    await prisma.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  return toDto(row);
}

/**
 * "Eliminar" un usuario desde el admin en realidad lo desactiva (isActive =
 * false) en vez de borrar la fila: así se conserva la integridad de
 * AuditLog/RefreshToken (que referencian al usuario) y el historial de
 * auditoría permanece completo, tal como pide la sección 9.
 */
export async function deactivateUser(id: string, requestedBy: string): Promise<void> {
  if (id === requestedBy) {
    throw new HttpError(400, 'No puedes desactivar tu propia cuenta');
  }
  await prisma.user.update({ where: { id }, data: { isActive: false } });
  await prisma.refreshToken.updateMany({
    where: { userId: id, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
