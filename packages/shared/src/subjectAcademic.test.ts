import { describe, expect, it } from 'vitest';
import { subjectSchema } from './schemas/index.js';
const subject = {
  code: 'ACF-0901',
  name: 'Cálculo diferencial',
  semester: 1,
  objective: 'Aplicar el cálculo diferencial.',
  programId: 'isc',
  prerequisiteIds: [],
};
describe('datos académicos de materias', () => {
  it('admite catálogos anteriores y valores desconocidos', () => {
    expect(subjectSchema.safeParse(subject).success).toBe(true);
    expect(
      subjectSchema.safeParse({
        ...subject,
        credits: null,
        theoryHours: null,
        practicalHours: null,
        syllabusMediaId: null,
      }).success,
    ).toBe(true);
  });
  it('valida horas semanales y fuentes web', () => {
    expect(
      subjectSchema.safeParse({
        ...subject,
        theoryHours: 3,
        practicalHours: 2,
        credits: 5,
        academicSourceUrl: 'https://dsc.itmorelia.edu.mx/web/documentos/reticula_isc.pdf',
        prerequisitesVerified: true,
      }).success,
    ).toBe(true);
    for (const value of [-1, 2.5, 41])
      expect(subjectSchema.safeParse({ ...subject, theoryHours: value }).success).toBe(false);
    expect(
      subjectSchema.safeParse({ ...subject, academicSourceUrl: 'javascript:alert(1)' }).success,
    ).toBe(false);
  });
});
