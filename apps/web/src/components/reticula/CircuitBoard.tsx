import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Subject, TeacherSummary } from '@dsc-isc/shared';
import SubjectModal from './SubjectModal';
import SubjectNode from './SubjectNode';

interface CircuitBoardProps {
  subjects: Subject[];
  teachersById: Record<string, TeacherSummary>;
}

interface Point {
  x: number;
  y: number;
}

/**
 * Retícula como circuito interactivo (sección 10.3): agrupada por
 * semestre, con líneas sólidas dibujadas a mano en un <svg> conectando
 * únicamente relaciones REALES de prerrequisito (Subject.prerequisiteIds),
 * nunca decorativas. Al pasar el mouse sobre un nodo se resaltan en color
 * signal las líneas hacia sus prerrequisitos directos; al hacer click se
 * abre SubjectModal con el detalle.
 */
export default function CircuitBoard({ subjects, teachersById }: CircuitBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>());
  const [positions, setPositions] = useState<Record<string, Point>>({});
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
      const next: Record<string, Point> = {};
      nodeRefs.current.forEach((el, id) => {
        const rect = el.getBoundingClientRect();
        next[id] = {
          x: rect.left - containerRect.left + rect.width / 2 + container.scrollLeft,
          y: rect.top - containerRect.top + rect.height / 2,
        };
      });
      setPositions(next);
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
        <svg className="pointer-events-none absolute left-0 top-0 h-full" style={{ width: '100%' }} aria-hidden="true">
          {prerequisiteEdges.map((edge) => {
            const from = positions[edge.from];
            const to = positions[edge.to];
            if (!from || !to) return null;
            const isHighlighted = hoveredId === edge.from || hoveredId === edge.to;
            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={isHighlighted ? '#3FB8D6' : '#E1E6EC'}
                strokeWidth={isHighlighted ? 2.5 : 1.5}
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
