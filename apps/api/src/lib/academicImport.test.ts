import { describe, expect, it } from 'vitest';
import { academicImportPatch } from './academicImport.js';
import { readFileSync } from 'node:fs';

const source = {
  academicSourceUrl:
    'https://dsc.itmorelia.edu.mx/web/documentos/asignaturas/AC001CalculoDiferencial.pdf',
  credits: 5,
  theoryHours: 3,
  practicalHours: 2,
};
describe('Importación conservadora de los planes institucionales', () => {
  it('reemplaza la retícula general por el programa individual y completa horas ausentes', () => {
    expect(
      academicImportPatch(
        {
          academicSourceUrl: 'https://dsc.itmorelia.edu.mx/web/documentos/reticula_isc.pdf',
          credits: 5,
          theoryHours: null,
          practicalHours: null,
        },
        source,
      ),
    ).toEqual({ academicSourceUrl: source.academicSourceUrl, theoryHours: 3, practicalHours: 2 });
  });
  it('conserva enlaces y datos capturados por el administrador, incluso al repetir la importación', () => {
    expect(
      academicImportPatch(
        {
          academicSourceUrl: 'https://institution.test/custom.pdf',
          credits: 4,
          theoryHours: 2,
          practicalHours: 2,
        },
        source,
      ),
    ).toEqual({});
    expect(academicImportPatch(source, source)).toEqual({});
  });
  it('incluye las 46 materias verificadas y las tres retículas con sus 16 programas individuales', () => {
    const data = JSON.parse(
      readFileSync(
        new URL('../../../../docs/academic/portal-curricula.json', import.meta.url),
        'utf8',
      ),
    );
    const verified = JSON.parse(
      readFileSync(
        new URL('../../../../docs/academic/isc-2017-verified.json', import.meta.url),
        'utf8',
      ),
    );
    expect(data.subjects.map((s: { code: string }) => s.code).sort()).toEqual(
      verified.subjects.map((s: { code: string }) => s.code).sort(),
    );
    expect(data.specialties.map((s: { subjects: unknown[] }) => s.subjects.length)).toEqual([
      5, 5, 6,
    ]);
    const all = [
      ...data.subjects,
      ...data.specialties.flatMap((s: { subjects: unknown[] }) => s.subjects),
    ];
    expect(new Set(all.map((s) => s.code)).size).toBe(62);
    for (const s of all) {
      expect(s.academicSourceUrl).toMatch(
        /^https:\/\/dsc\.itmorelia\.edu\.mx\/web\/documentos\/asignaturas\/.+\.pdf$/,
      );
      expect(s.pdfSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(s.theoryHours + s.practicalHours).toBe(s.credits);
    }
    expect(
      data.specialties[2].subjects.filter((s: { isElective: boolean }) => s.isElective),
    ).toHaveLength(3);
  });
});
