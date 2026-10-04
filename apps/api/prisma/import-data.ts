import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

/**
 * Script de un solo uso para migrar a Postgres/Supabase (ver README.md).
 * Restaura prisma/data-export.json (generado por export-sqlite-data.ts) en
 * la base nueva. Debe correrse después de aplicar las migraciones contra
 * Postgres (`npx prisma migrate deploy` o `dev`), con el cliente de Prisma
 * ya regenerado para "postgresql".
 *
 * Los IDs (cuid) se reutilizan tal cual, así que las relaciones quedan
 * intactas sin remapear nada — solo importa el orden de inserción (padres
 * antes que hijos) para no violar las llaves foráneas. Es seguro borrar
 * este archivo (y prisma/data-export.json) una vez confirmada la migración.
 */
const prisma = new PrismaClient();

function withDates(rows: any[], fields: string[]): any[] {
  return rows.map((row) => {
    const copy = { ...row };
    for (const field of fields) {
      if (copy[field]) copy[field] = new Date(copy[field]);
    }
    return copy;
  });
}

async function main() {
  const raw = await readFile(path.resolve(process.cwd(), 'prisma', 'data-export.json'), 'utf-8');
  const data = JSON.parse(raw);

  if (data.users.length > 0) await prisma.user.createMany({ data: withDates(data.users, ['createdAt', 'lockedUntil']) });
  if (data.mediaAssets.length > 0) await prisma.mediaAsset.createMany({ data: withDates(data.mediaAssets, ['createdAt']) });
  if (data.siteConfig.length > 0) await prisma.siteConfig.createMany({ data: withDates(data.siteConfig, ['updatedAt']) });
  if (data.timelineEvents.length > 0) await prisma.timelineEvent.createMany({ data: data.timelineEvents });
  if (data.heroSlides.length > 0) await prisma.heroSlide.createMany({ data: data.heroSlides });
  if (data.programs.length > 0) await prisma.program.createMany({ data: data.programs });
  if (data.subjects.length > 0) await prisma.subject.createMany({ data: data.subjects });
  if (data.subjectPrerequisites.length > 0) await prisma.subjectPrerequisite.createMany({ data: data.subjectPrerequisites });
  if (data.teachers.length > 0) await prisma.teacher.createMany({ data: data.teachers });
  if (data.teacherSubjects.length > 0) await prisma.teacherSubject.createMany({ data: data.teacherSubjects });
  if (data.labs.length > 0) await prisma.lab.createMany({ data: data.labs });
  if (data.labImages.length > 0) await prisma.labImage.createMany({ data: data.labImages });
  if (data.specialties.length > 0) await prisma.specialty.createMany({ data: data.specialties });
  if (data.documents.length > 0) await prisma.document.createMany({ data: withDates(data.documents, ['updatedAt']) });
  if (data.news.length > 0) await prisma.news.createMany({ data: withDates(data.news, ['publishedAt']) });
  if (data.communitySections.length > 0) await prisma.communitySection.createMany({ data: data.communitySections });
  if (data.auditLogs.length > 0) await prisma.auditLog.createMany({ data: withDates(data.auditLogs, ['createdAt']) });

  console.log('Datos restaurados en la base nueva.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
