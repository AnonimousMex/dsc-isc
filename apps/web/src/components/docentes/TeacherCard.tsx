import { ArrowUpRight } from 'lucide-react';
import TiltSurface from '../motion/TiltSurface';
import type { TeacherSummary } from '@dsc-isc/shared';
import TeacherAvatar from './TeacherAvatar';
export default function TeacherCard({
  teacher,
  onOpenDetail,
}: {
  teacher: TeacherSummary;
  onOpenDetail: (slug: string) => void;
}) {
  return (
    <button
      type="button"
      className="faculty-card"
      onClick={() => onOpenDetail(teacher.slug)}
      aria-label={`Conocer a ${teacher.fullName}`}
    >
      <TiltSurface className="faculty-portrait" strength={10}>
        <TeacherAvatar fullName={teacher.fullName} photo={teacher.photo} />
        <span className="faculty-open">
          <ArrowUpRight size={23} />
        </span>
      </TiltSurface>
      <div className="faculty-card-copy">
        <p className="section-kicker">{teacher.specialty ?? 'DOCENTE / ISC'}</p>
        <h3>{teacher.fullName}</h3>
        <p>{teacher.title}</p>
        <span>
          Materias y contacto <ArrowUpRight size={15} />
        </span>
      </div>
    </button>
  );
}
