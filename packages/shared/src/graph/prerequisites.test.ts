import { describe, expect, it } from 'vitest';
import { hasCycle, type PrerequisiteEdge } from './prerequisites';

describe('hasCycle', () => {
  it('reports no cycle for an empty graph', () => {
    expect(hasCycle([])).toBe(false);
  });

  it('reports no cycle for a simple linear chain (real retícula shape)', () => {
    // ISC-301 requiere ISC-201, que requiere ISC-101 — cadena normal, sin ciclo.
    const edges: PrerequisiteEdge[] = [
      { subjectId: 'ISC-301', prerequisiteId: 'ISC-201' },
      { subjectId: 'ISC-201', prerequisiteId: 'ISC-101' },
    ];
    expect(hasCycle(edges)).toBe(false);
  });

  it('reports no cycle for disconnected branches sharing no nodes', () => {
    const edges: PrerequisiteEdge[] = [
      { subjectId: 'A', prerequisiteId: 'B' },
      { subjectId: 'C', prerequisiteId: 'D' },
    ];
    expect(hasCycle(edges)).toBe(false);
  });

  it('detects a direct cycle between two subjects', () => {
    const edges: PrerequisiteEdge[] = [
      { subjectId: 'A', prerequisiteId: 'B' },
      { subjectId: 'B', prerequisiteId: 'A' },
    ];
    expect(hasCycle(edges)).toBe(true);
  });

  it('detects a transitive cycle across three subjects', () => {
    // A depende de B, B depende de C, y C (por error) depende de A.
    const edges: PrerequisiteEdge[] = [
      { subjectId: 'A', prerequisiteId: 'B' },
      { subjectId: 'B', prerequisiteId: 'C' },
      { subjectId: 'C', prerequisiteId: 'A' },
    ];
    expect(hasCycle(edges)).toBe(true);
  });

  it('detects a self-loop (una materia prerrequisito de sí misma)', () => {
    const edges: PrerequisiteEdge[] = [{ subjectId: 'A', prerequisiteId: 'A' }];
    expect(hasCycle(edges)).toBe(true);
  });

  it('does not flag a cycle when a shared prerequisite is reused legitimately (diamond shape)', () => {
    // D requiere B y C; B y C requieren A. Es un diamante, no un ciclo.
    const edges: PrerequisiteEdge[] = [
      { subjectId: 'D', prerequisiteId: 'B' },
      { subjectId: 'D', prerequisiteId: 'C' },
      { subjectId: 'B', prerequisiteId: 'A' },
      { subjectId: 'C', prerequisiteId: 'A' },
    ];
    expect(hasCycle(edges)).toBe(false);
  });

  it('detects a cycle hidden among otherwise-valid unrelated edges', () => {
    const edges: PrerequisiteEdge[] = [
      { subjectId: 'ISC-201', prerequisiteId: 'ISC-101' },
      { subjectId: 'ISC-202', prerequisiteId: 'ISC-201' },
      { subjectId: 'X', prerequisiteId: 'Y' },
      { subjectId: 'Y', prerequisiteId: 'X' },
    ];
    expect(hasCycle(edges)).toBe(true);
  });
});
