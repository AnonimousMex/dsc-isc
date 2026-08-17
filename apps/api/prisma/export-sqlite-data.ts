import 'dotenv/config';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

/**
 * Script de un solo uso para migrar a Postgres/Supabase (ver README.md).
 * Vuelca todas las tablas de la SQLite actual (apps/api/prisma/dev.db) a un
 * JSON plano en prisma/data-export.json, para restaurarlas después con
 * import-data.ts contra la base nueva.
 *
 * Debe correrse ANTES de cambiar `provider` a "postgresql" en
 * schema.prisma y de regenerar el cliente de Prisma — mientras el cliente
 * generado siga siendo el de SQLite, apuntando a dev.db.
 *
 * No incluye RefreshToken: son sesiones activas ligadas al servidor
 * anterior, se invalidan con la migración y basta con iniciar sesión de
 * nuevo. Es seguro borrar este archivo (y prisma/data-export.json) una vez
 * confirmada la migración.
 */
const prisma = new PrismaClient();

async function main() {
  const data = {
    users: await prisma.user.findMany(),
    mediaAssets: await prisma.mediaAsset.findMany(),
    siteConfig: await prisma.siteConfig.findMany(),
    timelineEvents: await prisma.timelineEvent.findMany(),
    heroSlides: await prisma.heroSlide.findMany(),
    programs: await prisma.program.findMany(),
    subjects: await prisma.subject.findMany(),
    subjectPrerequisites: await prisma.subjectPrerequisite.findMany(),
    teachers: await prisma.teacher.findMany(),
    teacherSubjects: await prisma.teacherSubject.findMany(),
    labs: await prisma.lab.findMany(),
    labImages: await prisma.labImage.findMany(),
    specialties: await prisma.specialty.findMany(),
    documents: await prisma.document.findMany(),
    news: await prisma.news.findMany(),
    communitySections: await prisma.communitySection.findMany(),
    auditLogs: await prisma.auditLog.findMany(),
  };

  const outPath = path.resolve(process.cwd(), 'prisma', 'data-export.json');
  await writeFile(outPath, JSON.stringify(data, null, 2), 'utf-8');

  const total = Object.values(data).reduce((sum, rows) => sum + rows.length, 0);
  console.log(`Exportadas ${total} filas de ${Object.keys(data).length} tablas a ${outPath}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
