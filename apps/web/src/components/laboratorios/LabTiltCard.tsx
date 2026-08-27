import { Link } from 'react-router-dom';
import { resizeImageUrl, type Lab } from '@dsc-isc/shared';
import { useTilt } from '../../lib/useTilt';

interface LabTiltCardProps {
  lab: Lab;
}

export default function LabTiltCard({ lab }: LabTiltCardProps) {
  const { ref, style, onMouseMove, onMouseLeave } = useTilt<HTMLAnchorElement>();
  const cover = lab.gallery[0] ?? null;

  return (
    <Link
      ref={ref}
      to={`/laboratorios/${lab.slug}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={style}
      className="group relative block aspect-[4/5] overflow-hidden rounded-lg"
    >
      {cover && (
        <img
          src={resizeImageUrl(cover.url, 700)}
          alt={cover.alt ?? lab.name}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-surface">
        <h2 className="text-lg font-bold">{lab.name}</h2>
        <p className="mt-1 line-clamp-2 text-xs text-line">{lab.description}</p>
      </div>
    </Link>
  );
}
