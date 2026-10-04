import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Subject, TeacherSummary } from '@dsc-isc/shared';
import SubjectModal from './SubjectModal';
import SubjectNode from './SubjectNode';

interface CircuitBoardProps {
  subjects: Subject[];
  teachersById: Record<string, TeacherSummary>;
}

interface NodeRect {
  left: number;
  right: number;
  centerY: number;
  top: number;
}

/**
 * Retícula como circuito interactivo (sección 10.3): agrupada por
 * semestre, con líneas sólidas dibujadas a mano en un <svg> conectando
 * únicamente relaciones REALES de prerrequisito (Subject.prerequisiteIds),
 * nunca decorativas. Al pasar el mouse sobre un nodo se resaltan en color
 * signal las líneas hacia sus prerrequisitos directos; al hacer click se
 * abre SubjectModal con el detalle.
 *
 * Las líneas se anclan al borde izquierdo/derecho de cada tarjeta (nunca
 * a su centro) y viajan en ángulo recto por los pasillos vacíos entre
 * columnas: así nunca pasan "por abajo" de una tarjeta ajena, que es lo
 * que hacía perder de vista qué se conecta con qué. Cuando el
 * prerrequisito está dos o más semestres atrás, la línea sube a un
 * carril común por encima de todas las tarjetas para cruzar las columnas
 * intermedias sin atravesarlas.
 */
export default function CircuitBoard({ subjects, teachersById }: CircuitBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>());
  const [positions, setPositions] = useState<Record<string, NodeRect>>({});
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const semesters = useMemo(() => {
    const map = new Map<number, Subject[]>();
    for (const subject of subjects) {
      const list = map.get(subject.semester) ?? [];
      list.push(subject);
      map.set(subject.semester, list);
    }
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [subjects]);

  const columnIndexBySemester = useMemo(() => {
    const map = new Map<number, number>();
    semesters.forEach(([semester], index) => map.set(semester, index));
    return map;
  }, [semesters]);

  const subjectsById = useMemo(() => {
    const map = new Map<string, Subject>();
    for (const subject of subjects) map.set(subject.id, subject);
    return map;
  }, [subjects]);

  const prerequisiteEdges = useMemo(() => {
    const edges: Array<{ from: string; to: string }> = [];
    for (const subject of subjects) {
      for (const prerequisiteId of subject.prerequisiteIds) {
        edges.push({ from: subject.id, to: prerequisiteId });
      }
    }
    return edges;
  }, [subjects]);

  useLayoutEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const next: Record<string, NodeRect> = {};
      nodeRefs.current.forEach((el, id) => {
        const rect = el.getBoundingClientRect();
        next[id] = {
          left: rect.left - containerRect.left + container.scrollLeft,
          right: rect.right - containerRect.left + container.scrollLeft,
          centerY: rect.top - containerRect.top + rect.height / 2,
          top: rect.top - containerRect.top,
        };
      });
      setPositions(next);
      // El <svg> vive dentro de un contenedor con scroll horizontal: si se
      // deja en width:100% (el ancho VISIBLE del contenedor), cualquier
      // línea hacia un nodo más allá de ese ancho queda recortada, porque
      // un <svg> recorta por defecto todo lo que se sale de su propia caja.
      // Hay que medir el ancho real del contenido (scrollWidth), no el del
      // viewport, para que el svg cubra toda el área con scroll.
      setContentSize({ width: container.scrollWidth, height: container.scrollHeight });
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [subjects]);

  // Carril común por encima de todas las tarjetas, para las líneas que
  // tienen que saltarse una o más columnas intermedias.
  const busY = useMemo(() => {
    const tops = Object.values(positions).map((p) => p.top);
    if (tops.length === 0) return 0;
    return Math.min(...tops) - 24;
  }, [positions]);

  const skipEdgeIndex = useMemo(() => {
    let counter = 0;
    const map = new Map<string, number>();
    for (const edge of prerequisiteEdges) {
      const fromCol = columnIndexBySemester.get(subjectsById.get(edge.from)?.semester ?? 0) ?? 0;
      const toCol = columnIndexBySemester.get(subjectsById.get(edge.to)?.semester ?? 0) ?? 0;
      if (fromCol - toCol > 1) {
        map.set(`${edge.from}-${edge.to}`, counter);
        counter += 1;
      }
    }
    return map;
  }, [prerequisiteEdges, columnIndexBySemester, subjectsById]);

  function buildEdgePath(edge: { from: string; to: string }): string | null {
    const from = positions[edge.from];
    const to = positions[edge.to];
    if (!from || !to) return null;

    const fromCol = columnIndexBySemester.get(subjectsById.get(edge.from)?.semester ?? 0) ?? 0;
    const toCol = columnIndexBySemester.get(subjectsById.get(edge.to)?.semester ?? 0) ?? 0;

    // `from` siempre es la materia posterior (sale por su borde izquierdo)
    // y `to` el prerrequisito, anterior en el tiempo (entra por su borde
    // derecho) — así la línea nunca cruza el cuerpo de ninguna tarjeta.
    const startX = from.left;
    const startY = from.centerY;
    const endX = to.right;
    const endY = to.centerY;

    if (fromCol - toCol <= 1) {
      const midX = (startX + endX) / 2;
      return `M ${startX},${startY} L ${midX},${startY} L ${midX},${endY} L ${endX},${endY}`;
    }

    const laneOffset = (skipEdgeIndex.get(`${edge.from}-${edge.to}`) ?? 0) * 6;
    const lane = busY - laneOffset;
    return `M ${startX},${startY} L ${startX},${lane} L ${endX},${lane} L ${endX},${endY}`;
  }

  const selectedSubject = subjects.find((s) => s.id === selectedId) ?? null;

  const isNodeHighlighted = (subjectId: string) => {
    if (hoveredId === subjectId) return true;
    return prerequisiteEdges.some(
      (edge) =>
        (edge.from === hoveredId && edge.to === subjectId) ||
        (edge.to === hoveredId && edge.from === subjectId),
    );
  };

  if (subjects.length === 0) {
    return <p className="text-sm text-muted">Aún no hay materias publicadas para esta retícula.</p>;
  }

  return (
    <div>
      <div ref={containerRef} className="relative overflow-x-auto pb-4">
        <svg
          className="pointer-events-none absolute left-0 top-0"
          style={{ width: contentSize.width || '100%', height: contentSize.height || '100%', overflow: 'visible' }}
          aria-hidden="true"
        >
          {prerequisiteEdges.map((edge) => {
            const path = buildEdgePath(edge);
            if (!path) return null;
            const isHighlighted = hoveredId === edge.from || hoveredId === edge.to;
            return (
              <path
                key={`${edge.from}-${edge.to}`}
                d={path}
                fill="none"
                className={isHighlighted ? 'stroke-signal' : 'stroke-line'}
                strokeWidth={isHighlighted ? 2.5 : 1.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        <div className="relative flex gap-10">
          {semesters.map(([semester, items]) => (
            <div key={semester} className="flex w-64 shrink-0 flex-col gap-4">
              <p className="border-b border-dashed border-line pb-3 font-mono text-xs uppercase tracking-widest text-muted">
                Semestre {semester}
              </p>
              {items.map((subject) => (
                <SubjectNode
                  key={subject.id}
                  ref={(el) => {
                    if (el) nodeRefs.current.set(subject.id, el);
                    else nodeRefs.current.delete(subject.id);
                  }}
                  subject={subject}
                  highlighted={isNodeHighlighted(subject.id)}
                  onHover={setHoveredId}
                  onSelect={setSelectedId}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {selectedSubject && (
        <SubjectModal
          subject={selectedSubject}
          allSubjects={subjects}
          teachersById={teachersById}
          onClose={() => setSelectedId(null)}
          onSelectPrerequisite={setSelectedId}
        />
      )}
    </div>
  );
}
