/** Completa únicamente datos ausentes. Nunca ejecutar el seed para esta tarea. */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const db = new PrismaClient();
const apply = process.argv.includes('--apply');
try {
  const data = JSON.parse(
    await readFile(
      new URL('../../../docs/academic/isc-2017-verified.json', import.meta.url),
      'utf8',
    ),
  ) as {
    sourceUrl: string;
    sha256: string;
    subjects: { code: string; theoryHours: number; practicalHours: number; credits: number }[];
  };
  const pdf = await readFile(
    new URL('../../web/public/documents/isc/reticula-isc.pdf', import.meta.url),
  );
  if (createHash('sha256').update(pdf).digest('hex') !== data.sha256)
    throw new Error('El PDF no coincide con la fuente verificada');
  if (
    data.subjects.length !== 46 ||
    new Set(data.subjects.map((s) => s.code)).size !== 46 ||
    data.subjects.reduce((a, s) => a + s.credits, 0) !== 210 ||
    data.subjects.some((s) => s.theoryHours + s.practicalHours !== s.credits)
  )
    throw new Error('Datos académicos inconsistentes');
  const program = await db.program.findUniqueOrThrow({
    where: { slug: 'isc' },
    include: { subjects: true },
  });
  const changes = data.subjects
    .map((s) => {
      const current = program.subjects.find((row) => row.code === s.code);
      if (!current) throw new Error(`Materia no encontrada: ${s.code}`);
      const patch: {
        credits?: number;
        theoryHours?: number;
        practicalHours?: number;
        academicSourceUrl?: string;
      } = {};
      for (const field of ['credits', 'theoryHours', 'practicalHours'] as const) {
        if (current[field] == null) patch[field] = s[field];
        else if (current[field] !== s[field])
          throw new Error(`Revisar conflicto: ${s.code} ${field}`);
      }
      if (!current.academicSourceUrl) patch.academicSourceUrl = data.sourceUrl;
      return { current, patch };
    })
    .filter((s) => Object.keys(s.patch).length);
  console.log(
    JSON.stringify({
      mode: apply ? 'apply' : 'dry-run',
      subjectsToComplete: changes.length,
      attachReticula: !program.reticulaPdfId,
    }),
  );
  if (apply) {
    const backup = `/private/tmp/isc-academic-backup-${Date.now()}.json`;
    await writeFile(
      backup,
      JSON.stringify(
        {
          programId: program.id,
          reticulaPdfId: program.reticulaPdfId,
          subjects: changes.map(({ current }) => ({
            id: current.id,
            code: current.code,
            credits: current.credits,
            theoryHours: current.theoryHours,
            practicalHours: current.practicalHours,
            academicSourceUrl: current.academicSourceUrl,
          })),
        },
        null,
        2,
      ),
      { mode: 0o600 },
    );
    await db.$transaction(
      async (tx) => {
        for (const { current, patch } of changes) {
          const result = await tx.subject.updateMany({
            where: {
              id: current.id,
              credits: current.credits,
              theoryHours: current.theoryHours,
              practicalHours: current.practicalHours,
              academicSourceUrl: current.academicSourceUrl,
            },
            data: patch,
          });
          if (result.count !== 1)
            throw new Error('La materia cambió durante la importación; se canceló la transacción');
        }
        if (!program.reticulaPdfId) {
          const media = await tx.mediaAsset.create({
            data: {
              kind: 'DOCUMENT',
              sourceType: 'EXTERNAL',
              path: data.sourceUrl,
              alt: 'Retícula oficial de Ingeniería en Sistemas Computacionales, plan 2017',
            },
          });
          const result = await tx.program.updateMany({
            where: { id: program.id, reticulaPdfId: null },
            data: { reticulaPdfId: media.id },
          });
          if (result.count !== 1) throw new Error('La retícula cambió durante la importación');
        }
      },
      { timeout: 60000 },
    );
    console.log(`Importación completada. Respaldo: ${backup}`);
  }
} finally {
  await db.$disconnect();
}
