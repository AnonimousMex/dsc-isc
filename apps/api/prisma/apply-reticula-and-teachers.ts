import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { ISC_PREREQUISITES, ISC_PROGRAM_SLUG, ISC_SUBJECTS } from './data/iscReticula2017.js';
import { DSC_TEACHERS, slugifyName } from './data/teachersDsc.js';

/**
 * Script de un solo uso: reemplaza las materias de relleno del seed
 * original (ISC-101..ISC-303) por la retícula oficial 2017, y agrega la
 * plantilla real de docentes del DSC — SIN tocar nada más (labs,
 * noticias, especialidades, ni ningún docente/materia que ya se haya
 * agregado desde el admin). Pensado para correrse una vez contra la base
 * ya en uso (Supabase), después de la migración de Postgres/S3.
 *
 * Es seguro volver a correrlo: las materias se upsertean por `code` y los
 * docentes por `slug`, así que no duplica nada si ya se aplicó antes.
 */
const prisma = new PrismaClient();

const OLD_FAKE_SUBJECT_CODES = [
  'ISC-101', 'ISC-102', 'ISC-103',
  'ISC-201', 'ISC-202', 'ISC-203',
  'ISC-301', 'ISC-302', 'ISC-303',
];

const OLD_FAKE_TEACHER_NAMES = [
  'Ana Villaseñor Cruz',
  'Luis Hernández Padilla',
  'Marina Torres Gómez',
  'Roberto Salgado Núñez',
  'Karla Jiménez Ortiz',
  'Eduardo Ramos Villagómez',
  'Paola Medina Rangel',
];

async function main() {
  const program = await prisma.program.findUnique({ where: { slug: ISC_PROGRAM_SLUG } });
  if (!program) {
    throw new Error(`No existe un Program con slug "${ISC_PROGRAM_SLUG}" — corre el seed original primero.`);
  }

  console.log('[reticula] quitando las materias de relleno del seed original (si siguen ahí)...');
  const fakeSubjects = await prisma.subject.findMany({ where: { code: { in: OLD_FAKE_SUBJECT_CODES } } });
  const fakeIds = fakeSubjects.map((s) => s.id);
  if (fakeIds.length > 0) {
    await prisma.subjectPrerequisite.deleteMany({
      where: { OR: [{ subjectId: { in: fakeIds } }, { prerequisiteId: { in: fakeIds } }] },
    });
    await prisma.teacherSubject.deleteMany({ where: { subjectId: { in: fakeIds } } });
    await prisma.subject.deleteMany({ where: { id: { in: fakeIds } } });
    console.log(`  quitadas ${fakeIds.length} materias de relleno.`);
  }

  console.log('[reticula] quitando los docentes de ejemplo del seed original (si siguen ahí)...');
  const deletedTeachers = await prisma.teacher.deleteMany({ where: { fullName: { in: OLD_FAKE_TEACHER_NAMES } } });
  console.log(`  quitados ${deletedTeachers.count} docentes de ejemplo.`);

  console.log('[reticula] cargando la retícula oficial ISC Plan 2017...');
  const subjectsByCode = new Map<string, { id: string }>();
  for (const def of ISC_SUBJECTS) {
    const subject = await prisma.subject.upsert({
      where: { code: def.code },
      update: { name: def.name, semester: def.semester, objective: def.objective, programId: program.id },
      create: { ...def, programId: program.id },
    });
    subjectsByCode.set(def.code, subject);
  }
  console.log(`  ${ISC_SUBJECTS.length} materias listas.`);

  console.log('[reticula] cargando prerrequisitos...');
  for (const [code, prereqCode] of ISC_PREREQUISITES) {
    const subject = subjectsByCode.get(code)!;
    const prerequisite = subjectsByCode.get(prereqCode)!;
    await prisma.subjectPrerequisite.upsert({
      where: { subjectId_prerequisiteId: { subjectId: subject.id, prerequisiteId: prerequisite.id } },
      update: {},
      create: { subjectId: subject.id, prerequisiteId: prerequisite.id },
    });
  }
  console.log(`  ${ISC_PREREQUISITES.length} prerrequisitos listos.`);

  console.log('[reticula] cargando la plantilla real de docentes del DSC...');
  let createdTeachers = 0;
  for (const fullName of DSC_TEACHERS) {
    const slug = slugifyName(fullName);
    const existing = await prisma.teacher.findUnique({ where: { slug } });
    if (existing) continue;
    await prisma.teacher.create({
      data: {
        slug,
        fullName,
        title: 'Docente',
        bio: '',
        experience: '',
        photoId: null,
        youtubeUrl: null,
        email: null,
        website: null,
        linkedin: null,
        facebook: null,
        twitter: null,
        isActive: true,
      },
    });
    createdTeachers += 1;
  }
  console.log(`  ${createdTeachers} docentes nuevos creados (${DSC_TEACHERS.length - createdTeachers} ya existían).`);

  console.log('\n[reticula] listo.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
