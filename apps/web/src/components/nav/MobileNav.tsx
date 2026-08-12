import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { navGroups } from './navData';

interface MobileNavProps {
  onClose: () => void;
}

export default function MobileNav({ onClose }: MobileNavProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-deep px-6 py-8 text-surface lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-widest text-signal">Menú</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-2 text-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
          aria-label="Cerrar menú"
        >
          ✕
        </button>
      </div>

      <div className="mt-10 flex flex-col gap-8">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="font-mono text-xs uppercase tracking-widest text-signal">{group.label}</p>
            <ul className="mt-3 flex flex-col gap-3">
              {group.links.map((link) => (
                <li key={link.label}>
                  {link.comingSoon ? (
                    <span className="block text-lg text-line">{link.label}</span>
                  ) : (
                    <Link to={link.href} onClick={onClose} className="block text-lg font-medium">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
