import { PrismaClient } from '@prisma/client';

// Instancia única compartida por toda la API (evita agotar conexiones de
// SQLite al recargar módulos en desarrollo con tsx watch).
export const prisma = new PrismaClient();
