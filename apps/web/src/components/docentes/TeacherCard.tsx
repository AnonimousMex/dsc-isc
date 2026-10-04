import { Link } from 'react-router-dom';
import type { TeacherSummary } from '@dsc-isc/shared';
import TeacherAvatar from './TeacherAvatar';

interface TeacherCardProps {
  teacher: TeacherSummary;
}

export default function TeacherCard({ teacher }: TeacherCardProps) {
  return (
    <Link
      to={`/docentes/${teacher.slug}`}
      className="group flex items-center gap-4 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
    >
      <div className="h-20 w-20 shrink-0 overflow-hidden bg-elevated">
        <TeacherAvatar fullName={teacher.fullName} photo={teacher.photo} />
      </div>
      <div>
        <h2 className="font-semibold text-ink group-hover:text-primary group-hover:underline">
          {teacher.fullName}
        </h2>
        <p className="mt-1 text-sm text-muted">{teacher.title}</p>
      </div>
    </Link>
  );
}
