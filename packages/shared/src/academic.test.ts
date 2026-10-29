import { describe, expect, it } from 'vitest';
import { subjectAcademicUrl } from './academic.js';
import { subjectSchema, specialtySchema } from './schemas/index.js';
import type { MediaAsset } from './types/index.js';

describe('Plan individual de una materia', () => {
  it('prioriza el documento del administrador sobre el enlace importado', () => {
    expect(
      subjectAcademicUrl({
        academicSourceUrl: 'https://institution.test/original.pdf',
        syllabus: { url: '/uploads/nuevo.pdf' } as MediaAsset,
      }),
    ).toBe('/uploads/nuevo.pdf');
    expect(
      subjectAcademicUrl({
        academicSourceUrl: 'https://institution.test/original.pdf',
        syllabus: null,
      }),
    ).toBe('https://institution.test/original.pdf');
    expect(subjectAcademicUrl({})).toBeNull();
  });
  it('rechaza enlaces ejecutables y conserva la relación con la especialidad', () => {
    const input = {
      code: 'TNB-2304',
      name: 'Internet de Todas las Cosas',
      semester: 9,
      objective: '',
      programId: 'isc',
      specialtyId: 'cloud',
      isElective: true,
    };
    expect(subjectSchema.parse(input)).toMatchObject({ specialtyId: 'cloud', isElective: true });
    expect(
      subjectSchema.safeParse({ ...input, academicSourceUrl: 'javascript:alert(1)' }).success,
    ).toBe(false);
    expect(
      specialtySchema.safeParse({
        slug: 'cloud',
        name: 'Nube',
        description: '',
        reticulaUrl: 'data:text/html,hello',
      }).success,
    ).toBe(false);
  });
});
