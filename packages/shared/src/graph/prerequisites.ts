export interface PrerequisiteEdge {
  subjectId: string;
  prerequisiteId: string;
}

/**
 * Detecta si el conjunto de relaciones "materia → prerrequisito" contiene
 * un ciclo (directo o indirecto). Se usa antes de guardar la retícula desde
 * el admin (ReticulaEditor) para rechazar relaciones que harían que una
 * materia dependiera, transitivamente, de sí misma. Es una función pura
 * (sin Prisma ni Express) para poder probarla de forma aislada.
 */
export function hasCycle(edges: PrerequisiteEdge[]): boolean {
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    const list = adjacency.get(edge.subjectId) ?? [];
    list.push(edge.prerequisiteId);
    adjacency.set(edge.subjectId, list);
  }

  const UNVISITED = 0;
  const VISITING = 1;
  const DONE = 2;
  const state = new Map<string, number>();

  function visit(node: string): boolean {
    state.set(node, VISITING);
    for (const next of adjacency.get(node) ?? []) {
      const nextState = state.get(next) ?? UNVISITED;
      if (nextState === VISITING) return true;
      if (nextState === UNVISITED && visit(next)) return true;
    }
    state.set(node, DONE);
    return false;
  }

  for (const node of adjacency.keys()) {
    if ((state.get(node) ?? UNVISITED) === UNVISITED) {
      if (visit(node)) return true;
    }
  }
  return false;
}
