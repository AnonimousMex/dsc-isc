import { PrismaClient } from '@prisma/client';
import { prismaDatasourceUrl } from './databaseConnection.js';

const globalDatabase = globalThis as typeof globalThis & { iscPrisma?: PrismaClient };
const databaseUrl = process.env.DATABASE_URL;
export const prisma =
  globalDatabase.iscPrisma ??
  new PrismaClient({
    ...(databaseUrl ? { datasources: { db: { url: prismaDatasourceUrl(databaseUrl) } } } : {}),
  });
if (process.env.NODE_ENV !== 'production') globalDatabase.iscPrisma = prisma;
