/** Non-destructive import: no seed, no deletion, no reassignment of teachers. */
import 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  specialtySchema,
  subjectSchema,
  type SubjectInput,
  type SpecialtyInput,
} from '@dsc-isc/shared';
import { academicImportPatch } from '../src/lib/academicImport.js';
import { prismaDatasourceUrl } from '../src/lib/databaseConnection.js';

const apply = process.argv.includes('--apply');
const db = new PrismaClient({
  datasources: { db: { url: prismaDatasourceUrl(process.env.DATABASE_URL!) } },
});
type ImportedSubject = SubjectInput & {
  academicSourceUrl: string;
  credits: number;
  theoryHours: number;
  practicalHours: number;
};
type ImportedSpecialty = SpecialtyInput & { subjects: ImportedSubject[] };

try {
  const manifest = JSON.parse(
    await readFile(
      new URL('../../../docs/academic/portal-curricula.json', import.meta.url),
      'utf8',
    ),
  ) as {
    subjects: ImportedSubject[];
    specialties: ImportedSpecialty[];
  };
  const normalize = (s: string) =>
    s
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  const result = await db.$transaction(
    async (tx) => {
      const program = await tx.program.findUniqueOrThrow({ where: { slug: 'isc' } });
      const existing = await tx.subject.findMany({ where: { programId: program.id } });
      const specialties = await tx.specialty.findMany();
      const summary = {
        mode: apply ? 'apply' : 'dry-run',
        subjectsCreated: 0,
        subjectsUpdated: 0,
        specialtiesCreated: 0,
        reticulasLinked: 0,
      };
      const backupDirectory = apply ? await mkdtemp(join(tmpdir(), 'dsc-curricula-')) : null;
      if (backupDirectory) {
        await writeFile(
          join(backupDirectory, 'before.json'),
          JSON.stringify({ programId: program.id, subjects: existing, specialties }, null, 2),
          { mode: 0o600 },
        );
        console.log(`Respaldo: ${join(backupDirectory, 'before.json')}`);
      }
      async function importSubject(source: ImportedSubject, specialtyId: string | null) {
        const input = subjectSchema.parse({ ...source, programId: program.id, specialtyId });
        const current =
          existing.find((row) => row.code === input.code) ??
          existing.find(
            (row) =>
              row.specialtyId === specialtyId && normalize(row.name) === normalize(input.name),
          );
        if (current) {
          if (current.specialtyId !== specialtyId)
            throw new Error(`Revisar retícula de ${input.code}: ya existe en otra especialidad.`);
          const patch = academicImportPatch(current, source);
          if (Object.keys(patch).length) {
            summary.subjectsUpdated++;
            if (apply) await tx.subject.update({ where: { id: current.id }, data: patch });
          }
        } else {
          summary.subjectsCreated++;
          if (apply) {
            const { prerequisiteIds: _prerequisites, ...data } = input;
            await tx.subject.create({ data });
          }
        }
      }
      for (const source of manifest.subjects) await importSubject(source, null);
      for (const source of manifest.specialties) {
        const input = specialtySchema.parse(source);
        let current = specialties.find((row) => row.slug === input.slug);
        if (!current) {
          summary.specialtiesCreated++;
          if (apply) current = await tx.specialty.create({ data: input });
        }
        if (current && !current.reticulaUrl && !current.reticulaPdfId) {
          summary.reticulasLinked++;
          if (apply)
            await tx.specialty.update({
              where: { id: current.id },
              data: { reticulaUrl: input.reticulaUrl },
            });
        }
        // Placeholder only in dry-run; never stored in the database.
        const specialtyId = current?.id ?? `dry-run:${input.slug}`;
        for (const row of source.subjects) await importSubject(row, specialtyId);
      }
      return summary;
    },
    { timeout: 60000, isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
  console.log(JSON.stringify(result, null, 2));
} finally {
  await db.$disconnect();
}
