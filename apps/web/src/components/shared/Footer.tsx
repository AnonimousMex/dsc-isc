import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import CareerLogo from './CareerLogo';
import { usePresentation } from '../../lib/PresentationContext';

const groups = [
  {
    title: 'DESCUBRE SISTEMAS',
    links: [
      { label: 'Conócenos', href: '/nosotros' },
      { label: 'Ingeniería en Sistemas Computacionales', href: '/oferta-educativa/isc' },
      { label: 'Docentes', href: '/docentes' },
      { label: 'Laboratorios', href: '/laboratorios' },
    ],
  },
  {
    title: 'TU COMUNIDAD',
    links: [
      { label: 'Vida estudiantil', href: '/comunidad' },
      { label: 'Noticias', href: '/noticias' },
      { label: 'Egresados', href: '/egresados' },
      { label: 'Registro de egresados', href: '/egresados/registro' },
    ],
  },
  {
    title: 'RECURSOS',
    links: [
      { label: 'Plan de estudios', href: '/oferta-educativa/isc#reticula' },
      { label: 'Especialidades', href: '/especialidades' },
      { label: 'Normateca', href: '/normateca' },
      { label: 'Aviso de privacidad', href: '/aviso-de-privacidad' },
    ],
  },
];
export default function Footer() {
  const { home } = usePresentation();
  return (
    <footer className="systems-footer">
      <div className="page-width footer-grid">
        <div className="footer-identity">
          <CareerLogo className="footer-career-logo" />
          <p className="editable-footer-title">{home.footerTitle}</p>
          <span>Instituto Tecnológico de Morelia</span>
          <address>
            Av. Tecnológico No. 1500
            <br />
            Lomas de Santiaguito, C.P. 58120
            <br />
            Morelia, Michoacán, México.
          </address>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <h2>{group.title}</h2>
            <ul>
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link to={link.href}>
                    {link.label}
                    <ArrowUpRight size={14} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="footer-affiliation page-width">
        <div
          className="footer-institutional-logos"
          aria-label="Identidad institucional y de la carrera"
        >
          <img
            src="/logos/itm-mark.svg"
            alt="Instituto Tecnológico de Morelia"
            className="footer-itm-mark"
            width="76"
            height="76"
            loading="lazy"
          />
          <span aria-hidden="true" />
          <img
            src="/logos/isc-mark.svg"
            alt="Ingeniería en Sistemas Computacionales — ISC"
            className="footer-isc-mark"
            width="125"
            height="38"
            loading="lazy"
          />
        </div>
        <p>
          Ingeniería en Sistemas Computacionales · ITM
          <br />
          <span>Proyecto de rediseño del sitio del departamento.</span>
        </p>
      </div>
      <div className="footer-bottom page-width">
        <span>© {new Date().getFullYear()} Ingeniería en Sistemas Computacionales</span>
        <Link to="/aviso-de-privacidad">
          Privacidad <ArrowUpRight size={13} />
        </Link>
      </div>
    </footer>
  );
}
