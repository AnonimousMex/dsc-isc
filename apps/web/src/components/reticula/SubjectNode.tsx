import { forwardRef } from 'react';
import type { Subject } from '@dsc-isc/shared';

interface SubjectNodeProps {
  subject: Subject;
  highlighted: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

const SubjectNode = forwardRef<HTMLButtonElement, SubjectNodeProps>(function SubjectNode(
  { subject, highlighted, onHover, onSelect },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      onMouseEnter={() => onHover(subject.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(subject.id)}
      onBlur={() => onHover(null)}
      onClick={() => onSelect(subject.id)}
      className="group relative z-10 flex w-full items-center gap-3 rounded border border-line bg-surface px-4 py-3 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
    >
      <span
        className={`h-3 w-3 shrink-0 rounded-full border-2 transition-all duration-200 ${
          highlighted ? 'scale-125 rotate-45 border-signal bg-signal' : 'border-primary bg-surface'
        }`}
        aria-hidden="true"
      />
      <span className="min-w-0">
        <span className="block font-mono text-xs text-muted">{subject.code}</span>
        <span className="block truncate text-sm font-semibold text-ink">{subject.name}</span>
      </span>
    </button>
  );
});

export default SubjectNode;
