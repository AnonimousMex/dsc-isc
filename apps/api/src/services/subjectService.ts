import type { Prisma } from '@prisma/client';
import { hasCycle, type Subject, type SubjectInput } from '@dsc-isc/shared';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';

const include = {
  prerequisites: true,
  teachers: true,
} satisfies Prisma.SubjectInclude;
type SubjectRow = Prisma.SubjectGetPayload<{ include: typeof include }>;

function toDto(row: SubjectRow): Subject {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    semester: row.semester,
    objective: row.objective,
    programId: row.programId,
    teacherIds: row.teachers.map((t) => t.teacherId),
    prerequisiteIds: row.prerequisites.map((p) => p.prerequisiteId),
  };
}

export async function listSubjects(programId?: string): Promise<Subject[]> {
  const rows = await prisma.subject.findMany({
    where: programId ? { programId } : undefined,
    include,
    orderBy: [{ semester: 'asc' }, { code: 'asc' }],
  });
  return rows.map(toDto);
}

export async function getSubject(id: string): Promise<Subject> {
  const row = await prisma.subject.findUnique({ where: { id }, include });
  if (!row) throw new HttpError(404, 'Materia no encontrada');
  return toDto(row);
}

async function assertNoCycle(subjectId: string, prerequisiteIds: string[]) {
  if (prerequisiteIds.includes(subjectId)) {
    throw new HttpError(409, 'Una materia no puede ser prerrequisito de sí misma');
  }
  const otherEdges = await prisma.subjectPrerequisite.findMany({
    where: { subjectId: { not: subjectId } },
    select: { subjectId: true, prerequisiteId: true },
  });
  const proposedEdges = prerequisiteIds.map((prerequisiteId) => ({ subjectId, prerequisiteId }));
  if (hasCycle([...otherEdges, ...proposedEdges])) {
    throw new HttpError(
      409,
      'Esa relación de prerrequisitos crearía un ciclo (una materia dependería, directa o indirectamente, de sí misma)',
    );
  }
}

export async function createSubject(input: SubjectInput): Promise<Subject> {
  await assertNoCycle('__new__', input.prerequisiteIds);
  const created = await prisma.subject.create({
    data: {
      code: input.code,
      name: input.name,
      semester: input.semester,
      objective: input.objective,
      programId: input.programId,
    },
  });
  if (input.prerequisiteIds.length > 0) {
    await prisma.subjectPrerequisite.createMany({
      data: input.prerequisiteIds.map((prerequisiteId) => ({
        subjectId: created.id,
        prerequisiteId,
      })),
    });
  }
  return getSubject(created.id);
}

export async function updateSubject(id: string, input: SubjectInput): Promise<Subject> {
  await assertNoCycle(id, input.prerequisiteIds);

  await prisma.$transaction([
    prisma.subject.update({
      where: { id },
      data: {
        code: input.code,
        name: input.name,
        semester: input.semester,
        objective: input.objective,
        programId: input.programId,
      },
    }),
    prisma.subjectPrerequisite.deleteMany({ where: { subjectId: id } }),
    ...(input.prerequisiteIds.length > 0
      ? [
          prisma.subjectPrerequisite.createMany({
            data: input.prerequisiteIds.map((prerequisiteId) => ({ subjectId: id, prerequisiteId })),
          }),
        ]
      : []),
  ]);

  return getSubject(id);
}

export async function deleteSubject(id: string): Promise<void> {
  await prisma.subject.delete({ where: { id } });
}
