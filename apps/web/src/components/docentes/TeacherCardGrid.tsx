import { Link } from 'react-router-dom';
import type { TeacherSummary } from '@dsc-isc/shared';
import TeacherAvatar from './TeacherAvatar';

interface TeacherCardGridProps {
  teacher: TeacherSummary;
}

/** Vista "mosaico": tarjeta con foto cuadrada, para hojear el cuerpo docente en rejilla. */
export default function TeacherCardGrid({ teacher }: TeacherCardGridProps) {
  return (
    <Link
      to={`/docentes/${teacher.slug}`}
      className="group block overflow-hidden rounded-lg border border-line bg-surface transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
    >
      <div className="aspect-square w-full overflow-hidden">
        <TeacherAvatar
          fullName={teacher.fullName}
          photo={teacher.photo}
          className="transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
      <div className="p-4">
        <h2 className="font-semibold text-ink group-hover:text-primary">{teacher.fullName}</h2>
        <p className="mt-1 text-xs text-muted">{teacher.title}</p>
      </div>
    </Link>
  );
}
