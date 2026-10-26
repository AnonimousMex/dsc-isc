import type { Subject } from '@dsc-isc/shared';

interface SubjectCardProps {
  subject: Subject;
  onSelect: (id: string) => void;
}

/**
 * Tarjeta de materia: clave + nombre + créditos siempre visibles: al
 * pasar el mouse, un panel se despliega hacia abajo mostrando el objetivo
 * (competencias y objetivos de aprendizaje). Click abre el detalle
 * completo en modal — así el contenido también es accesible sin mouse
 * (teclado, touch).
 */
export default function SubjectCard({ subject, onSelect }: SubjectCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(subject.id)}
      className="card-interactive group flex h-full flex-col p-5 text-left"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">{subject.code}</p>
        {subject.credits != null && (
          <span className="shrink-0 rounded-full bg-elevated px-2 py-0.5 font-mono text-[11px] text-muted">
            {subject.credits} cr.
          </span>
        )}
      </div>
      <h3 className="mt-2 font-bold leading-snug text-ink">{subject.name}</h3>

      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out group-hover:grid-rows-[1fr]">
        <div className="overflow-hidden">
          <p className="mt-3 line-clamp-4 text-xs text-muted">{subject.objective}</p>
        </div>
      </div>
    </button>
  );
}
