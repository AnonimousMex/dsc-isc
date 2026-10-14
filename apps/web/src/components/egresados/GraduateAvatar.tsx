import { avatarColorFor, initialsFor } from '@dsc-isc/shared';
import type { GraduateProfile } from '@dsc-isc/shared';

export default function GraduateAvatar({ graduate }: { graduate: GraduateProfile }) {
  return graduate.photoUrl ? (
    <img src={graduate.photoUrl} alt={graduate.fullName} loading="lazy" className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full w-full items-center justify-center font-mono text-3xl font-bold text-surface" style={{ backgroundColor: avatarColorFor(graduate.fullName) }} aria-hidden="true">
      {initialsFor(graduate.fullName)}
    </div>
  );
}
