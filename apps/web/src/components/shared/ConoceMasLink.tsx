import { ArrowRight } from 'lucide-react';

interface ConoceMasLinkProps {
  label?: string;
  className?: string;
}

/**
 * El link "Conoce más →" de tec.mx/es, repetido en cada tarjeta y sección
 * del sitio: texto + flecha que se desliza un poco al pasar el mouse. Es
 * solo el contenido visual — va dentro de un <Link>/<a> que ya trae el
 * `group` para que `group-hover` funcione (ver usos en Home, EducationTabs,
 * tarjetas de docentes/especialidades/noticias).
 */
export default function ConoceMasLink({ label = 'Conoce más', className = '' }: ConoceMasLinkProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-medium text-primary ${className}`}
    >
      {label}
      <ArrowRight
        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
        aria-hidden="true"
      />
    </span>
  );
}
