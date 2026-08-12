import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { navGroups } from './navData';

interface MegaMenuProps {
  tone: 'light' | 'dark';
}

export default function MegaMenu({ tone }: MegaMenuProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  return (
    <nav className="hidden items-center gap-8 lg:flex" onMouseLeave={() => setOpenGroup(null)}>
      {navGroups.map((group) => (
        <div key={group.label} className="relative" onMouseEnter={() => setOpenGroup(group.label)}>
          <button
            type="button"
            className={`text-sm font-medium tracking-wide transition-colors ${
              tone === 'light' ? 'text-surface hover:text-signal' : 'text-ink hover:text-primary'
            }`}
            aria-expanded={openGroup === group.label}
            onFocus={() => setOpenGroup(group.label)}
          >
            {group.label}
          </button>

          <AnimatePresence>
            {openGroup === group.label && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
                className="absolute left-0 top-full z-50 mt-3 w-80 rounded-md border border-line bg-surface p-2 shadow-lg"
              >
                {group.links.map((link) =>
                  link.comingSoon ? (
                    <span
                      key={link.label}
                      className="block cursor-not-allowed rounded px-4 py-3"
                      title="Próximamente"
                    >
                      <span className="block text-sm font-semibold text-muted">{link.label}</span>
                      <span className="block text-xs text-muted">{link.blurb}</span>
                    </span>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="block rounded px-4 py-3 transition-colors hover:bg-elevated"
                      onClick={() => setOpenGroup(null)}
                    >
                      <span className="block text-sm font-semibold text-ink">{link.label}</span>
                      <span className="block text-xs text-muted">{link.blurb}</span>
                    </Link>
                  ),
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </nav>
  );
}
