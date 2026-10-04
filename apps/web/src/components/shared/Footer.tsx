import { Link } from 'react-router-dom';
import { navGroups } from '../nav/navData';

export default function Footer() {
  return (
    <footer className="border-t border-line bg-elevated">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <img src="/logos/dsc-logo.png" alt="Departamento de Sistemas y Computación" className="h-10 w-auto" />
          <p className="mt-3 max-w-xs text-sm text-muted">
            Departamento de Sistemas y Computación. Rediseño propio, no es el sitio oficial del
            Instituto Tecnológico de Morelia.
          </p>
          <div className="mt-5 flex items-center gap-5">
            <img src="/logos/itm-logo.jpeg" alt="Instituto Tecnológico de Morelia" className="h-14 w-auto" />
            <img src="/logos/isc-logo.png" alt="Ingeniería en Sistemas Computacionales" className="h-14 w-auto" />
          </div>
        </div>

        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">{group.label}</p>
            <ul className="mt-4 flex flex-col gap-2">
              {group.links.map((link) => (
                <li key={link.label}>
                  {link.comingSoon ? (
                    <span className="text-sm text-muted">{link.label} (próximamente)</span>
                  ) : (
                    <Link to={link.href} className="text-sm text-ink hover:text-primary">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line px-6 py-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} Departamento de Sistemas y Computación · Contenido gestionado desde el sistema interno
      </div>
    </footer>
  );
}
