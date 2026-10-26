import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Menu } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import MobileNav from './MobileNav';
import CareerLogo from '../shared/CareerLogo';

const NAV_ITEMS = [
  { label: 'Conócenos', href: '/nosotros' },
  { label: 'La carrera', href: '/oferta-educativa/isc' },
  { label: 'Docentes', href: '/docentes' },
  { label: 'Laboratorios', href: '/laboratorios' },
  { label: 'Comunidad', href: '/comunidad' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>
      <header className="site-header">
        <div className="utility-bar">
          <div className="page-width">
            <span>Instituto Tecnológico de Morelia</span>
            <div>
              <a href="https://mscitmorelia.com.mx/" target="_blank" rel="noopener noreferrer">
                Maestría <ArrowUpRight size={12} />
              </a>
              <Link to="/noticias">Noticias</Link>
              <Link to="/egresados">Egresados</Link>
              <Link to="/normateca">
                Normateca <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>
        </div>
        <div className="main-navigation page-width">
          <Link
            to="/"
            aria-label="Ingeniería en Sistemas Computacionales — Inicio"
            className="systems-brand"
          >
            <CareerLogo className="header-career-logo" decorative />
            <span>
              <small>INGENIERÍA EN</small>SISTEMAS<span>COMPUTACIONALES</span>
            </span>
          </Link>
          <nav aria-label="Navegación principal" className="desktop-navigation">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Link to="/oferta-educativa/isc#reticula" className="nav-plan">
            Plan de estudios <ArrowUpRight size={16} />
          </Link>
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
          >
            <Menu />
          </button>
        </div>
      </header>
      <AnimatePresence>
        {mobileOpen && <MobileNav items={NAV_ITEMS} onClose={() => setMobileOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
