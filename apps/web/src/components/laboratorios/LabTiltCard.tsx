import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { resizeImageUrl, type Lab } from '@dsc-isc/shared';

interface LabTiltCardProps {
  lab: Lab;
}

const MAX_TILT_DEG = 10;

/**
 * Tilt 3D por posición del mouse (sección 10.5): la rotación es
 * proporcional a la distancia del cursor al centro de la tarjeta. Se
 * desactiva por completo con prefers-reduced-motion.
 */
export default function LabTiltCard({ lab }: LabTiltCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cover = lab.gallery[0] ?? null;

  const handleMouseMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (event.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -MAX_TILT_DEG * 2, y: px * MAX_TILT_DEG * 2 });
  };

  return (
    <Link
      ref={ref}
      to={`/laboratorios/${lab.slug}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 150ms ease-out',
      }}
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
