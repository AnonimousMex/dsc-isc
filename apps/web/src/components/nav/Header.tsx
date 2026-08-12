import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import MegaMenu from './MegaMenu';
import MobileNav from './MobileNav';

// Rutas con hero cinematográfico a pantalla completa (sección 5.3): el
// header arranca transparente sobre la imagen/video y se "viste" (fondo
// sólido) al hacer scroll — patrón Gucci/Louis Vuitton descrito en 2.3.
const CINEMATIC_EXACT_ROUTES = new Set(['/', '/laboratorios']);
const CINEMATIC_PREFIXES = ['/oferta-educativa/'];

function isCinematicRoute(pathname: string): boolean {
  return CINEMATIC_EXACT_ROUTES.has(pathname) || CINEMATIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export default function Header() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isCinematic = isCinematicRoute(location.pathname);

  useEffect(() => {
    setScrolled(false);
    const onScroll = () => {
      // En rutas cinematográficas, el header solo se "viste" una vez que
      // se cruzó por completo el hero (no a los primeros px de scroll) —
      // se mide el borde inferior real del wrapper del hero, no un umbral
      // fijo, porque su alto varía según el número de slides.
      const heroWrapper = document.getElementById('hero-wrapper');
      if (heroWrapper) {
        setScrolled(heroWrapper.getBoundingClientRect().bottom <= 0);
      } else {
        setScrolled(window.scrollY > 40);
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  const solid = scrolled || !isCinematic;
  const tone: 'light' | 'dark' = solid ? 'dark' : 'light';

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-signal focus:px-4 focus:py-2 focus:text-ink"
      >
        Saltar al contenido
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
          solid ? 'bg-surface/95 shadow-sm backdrop-blur' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className={`font-mono text-sm font-bold uppercase tracking-widest ${
              tone === 'light' ? 'text-surface' : 'text-ink'
            }`}
          >
            DSC · ITM
          </Link>

          <MegaMenu tone={tone} />

          <button
            type="button"
            className={`rounded p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal lg:hidden ${
              tone === 'light' ? 'text-surface' : 'text-ink'
            }`}
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <span className="block h-0.5 w-6 bg-current" />
            <span className="mt-1.5 block h-0.5 w-6 bg-current" />
            <span className="mt-1.5 block h-0.5 w-6 bg-current" />
          </button>
        </div>
      </header>

      <AnimatePresence>{mobileOpen && <MobileNav onClose={() => setMobileOpen(false)} />}</AnimatePresence>
    </>
  );
}
