import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { TimelineEvent } from '@dsc-isc/shared';

interface InteractiveTimelineProps {
  events: TimelineEvent[];
}

/**
 * Timeline horizontal con scroll-snap (sección 10.2): cada año es
 * clicable, expande su descripción con una animación de alto (Framer
 * Motion), y el punto activo cambia a color signal en 250ms.
 */
export default function InteractiveTimeline({ events }: InteractiveTimelineProps) {
  const [activeId, setActiveId] = useState<string | null>(events[0]?.id ?? null);
  const active = events.find((event) => event.id === activeId) ?? null;

  if (events.length === 0) return null;

  return (
    <div>
      <div
        className="flex snap-x snap-mandatory gap-10 overflow-x-auto pb-4"
        role="tablist"
        aria-label="Línea de tiempo del departamento"
      >
        {events.map((event) => {
          const isActive = event.id === activeId;
          return (
            <button
              key={event.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(event.id)}
              className="flex shrink-0 snap-start flex-col items-center gap-3 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
            >
              <span className={`font-mono text-sm ${isActive ? 'font-bold text-signal' : 'text-muted'}`}>
                {event.year}
              </span>
              <span
                className={`h-3 w-3 rounded-full transition-colors duration-[250ms] ${
                  isActive ? 'bg-signal' : 'bg-line'
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-2 h-px w-full bg-line" />

      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="max-w-2xl pt-6">
              <h2 className="text-xl font-bold text-ink">{active.title}</h2>
              <p className="mt-2 text-muted">{active.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
