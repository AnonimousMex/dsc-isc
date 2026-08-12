import { avatarColorFor, initialsFor, resizeImageUrl } from '@dsc-isc/shared';
import type { MediaAsset } from '@dsc-isc/shared';

interface TeacherAvatarProps {
  fullName: string;
  photo: MediaAsset | null;
  className?: string;
}

export default function TeacherAvatar({ fullName, photo, className = '' }: TeacherAvatarProps) {
  if (photo) {
    return (
      <img
        src={resizeImageUrl(photo.url, 400)}
        alt={photo.alt ?? fullName}
        className={`h-full w-full object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center font-mono text-2xl font-bold text-surface ${className}`}
      style={{ backgroundColor: avatarColorFor(fullName) }}
      aria-hidden="true"
    >
      {initialsFor(fullName)}
    </div>
  );
}
