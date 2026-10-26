import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface MobileNavProps {
  items: Array<{ label: string; href: string }>;
  onClose: () => void;
}

const MORE_LINKS = [
  { label: 'Retículas y especialidades', href: '/especialidades' },
  { label: 'Normateca', href: '/normateca' },
  { label: 'Egresados', href: '/egresados' },
  { label: 'Noticias', href: '/noticias' },
];

export default function MobileNav({ items, onClose }: MobileNavProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('a, button');
      if (!focusable?.length) return;
      const first = focusable[0],
        last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);
  return (
    <motion.div
      ref={dialogRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-deep px-6 py-8 text-ink lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación"
    >
      <div className="flex items-center justify-between">
        <span className="label-mono">ISC / Menú</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-2 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
          aria-label="Cerrar menú"
        >
          ✕
        </button>
      </div>

      <ul className="mt-10 flex flex-col gap-5">
        <li>
          <Link to="/" onClick={onClose} className="block text-lg font-medium">
            Inicio
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.href}>
            <Link to={item.href} onClick={onClose} className="block text-lg font-medium">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <a
        href="https://mscitmorelia.com.mx/"
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className="mt-5 block text-lg font-medium"
      >
        Maestría ↗
      </a>
      <div className="mt-10 border-t border-line/10 pt-6">
        <p className="label-mono">Más</p>
        <ul className="mt-3 flex flex-col gap-3">
          {MORE_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                onClick={onClose}
                className="block text-sm text-line hover:text-ink"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
