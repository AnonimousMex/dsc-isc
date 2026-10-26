import { usePresentation } from '../../lib/PresentationContext';
import { useMotionSettings } from '../motion/MotionExperience';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import type { TimelineEvent } from '@dsc-isc/shared';

export default function InteractiveTimeline({ events }: { events: TimelineEvent[] }) {
  const { timeline } = usePresentation();
  const [index, setIndex] = useState(0);
  const { enabled } = useMotionSettings();
  const [playing, setPlaying] = useState(timeline.autoplay);
  const [onScreen, setOnScreen] = useState(false);
  const [tabVisible, setTabVisible] = useState(!document.hidden);
  const root = useRef<HTMLDivElement>(null),
    track = useRef<HTMLDivElement>(null);
  const current = index % Math.max(events.length, 1),
    active = events[current];
  const running = playing && enabled && onScreen && tabVisible && events.length > 1;
  const choose = (next: number) => {
    setIndex((next + events.length) % events.length);
    setPlaying(false);
  };
  useEffect(() => setPlaying(timeline.autoplay), [timeline.autoplay]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      threshold: 0.2,
    });
    if (root.current) observer.observe(root.current);
    const update = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % events.length),
      timeline.interval * 1000,
    );
    return () => clearInterval(timer);
  }, [running, events.length, current, timeline.interval]);
  useEffect(() => {
    const selected = track.current?.querySelector<HTMLElement>('[aria-current="step"]');
    if (selected && track.current)
      track.current.scrollTo({
        left: selected.offsetLeft - track.current.offsetLeft - 24,
        behavior: enabled ? 'smooth' : 'instant',
      });
  }, [current, enabled]);
  if (!active) return null;
  return (
    <div
      ref={root}
      className="history-carousel history-v2"
      aria-roledescription="carrusel"
      aria-label="Historia de Ingeniería en Sistemas Computacionales"
    >
      <div className="history-topline">
        <span>TRAYECTORIA / ISC</span>
        <span>
          {playing && enabled
            ? `AVANCE AUTOMÁTICO · ${timeline.interval} S`
            : 'EN PAUSA · EXPLORA A TU RITMO'}
        </span>
      </div>
      <div className="history-progress" aria-hidden="true">
        <span
          key={current}
          style={{
            animationPlayState: running ? 'running' : 'paused',
            animationDuration: `${timeline.interval}s`,
          }}
        />
      </div>
      <div
        className="history-track"
        ref={track}
        aria-label="Selecciona un año"
        onKeyDown={(event) => {
          let next = current;
          if (event.key === 'ArrowRight') next = (current + 1) % events.length;
          else if (event.key === 'ArrowLeft') next = (current + events.length - 1) % events.length;
          else if (event.key === 'Home') next = 0;
          else if (event.key === 'End') next = events.length - 1;
          else return;
          event.preventDefault();
          choose(next);
          event.currentTarget.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
        }}
      >
        {events.map((event, i) => (
          <button
            key={event.id}
            type="button"
            aria-current={i === current ? 'step' : undefined}
            aria-label={`${event.year}: ${event.title}`}
            className={i <= current ? 'history-reached' : ''}
            onClick={() => choose(i)}
          >
            <span>{event.year}</span>
            <i />
          </button>
        ))}
      </div>
      <div className="history-slide" aria-live={running ? 'off' : 'polite'}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            className="history-slide-inner"
            initial={{ opacity: 0, x: enabled ? 45 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: enabled ? -35 : 0 }}
            transition={{ duration: enabled ? 0.4 : 0 }}
          >
            <div className="history-year-scene">
              <span className="history-year" aria-hidden="true">
                {active.year}
              </span>
              <span className="history-year-orbit" aria-hidden="true" />
            </div>
            <div>
              <p className="section-kicker">NUESTRA HISTORIA</p>
              <h3>{active.title}</h3>
              <p>{active.description}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="history-controls">
        <span>{active.year}</span>
        <div>
          <button
            type="button"
            aria-label="Momento anterior"
            disabled={events.length < 2}
            onClick={() => choose(current - 1)}
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            aria-label={
              playing && enabled ? 'Pausar línea del tiempo' : 'Reproducir línea del tiempo'
            }
            disabled={!enabled || events.length < 2}
            onClick={() => setPlaying((v) => !v)}
          >
            {playing && enabled ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            type="button"
            aria-label="Siguiente momento"
            disabled={events.length < 2}
            onClick={() => choose(current + 1)}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
