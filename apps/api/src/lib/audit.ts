import { prisma } from './prisma.js';

/**
 * Registra toda mutación relevante (sección 8/9: trazabilidad). `before`/
 * `after` se guardan como JSON serializado a mano porque SQLite no tiene un
 * tipo `Json` nativo robusto en Prisma (ver nota en schema.prisma).
 */
export async function recordAudit(params: {
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      before: params.before !== undefined ? JSON.stringify(params.before) : null,
      after: params.after !== undefined ? JSON.stringify(params.after) : null,
    },
  });
}
