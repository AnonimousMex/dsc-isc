import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import type { HeroSlide } from '@dsc-isc/shared';
import { usePresentation } from '../../lib/PresentationContext';
import { useMotionSettings } from '../motion/MotionExperience';

export default function HomeHeroGallery({
  slides,
  artwork,
}: {
  slides: HeroSlide[];
  artwork: ReactNode;
}) {
  const { enabled } = useMotionSettings();
  const { home } = usePresentation();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(home.autoplay);
  const [visible, setVisible] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const published = slides
    .filter((s) => s.isActive && s.media.kind === 'IMAGE')
    .sort((a, b) => a.order - b.order);
  const photos = published.length
    ? published.map((s) => ({
        id: s.id,
        url: s.media.url,
        alt: s.media.alt ?? 'Ingeniería en Sistemas Computacionales',
      }))
    : [
        {
          id: 'infraestructura',
          url: '/images/tecnologia.jpg',
          alt: 'Fotografía editorial de circuitos y arquitectura de hardware',
        },
        {
          id: 'colaboracion',
          url: '/images/comunidad.jpg',
          alt: 'Fotografía editorial de colaboración en un proyecto tecnológico',
        },
        {
          id: 'soluciones',
          url: '/images/desarrollo.jpg',
          alt: 'Fotografía editorial de herramientas para diseñar soluciones computacionales',
        },
      ];
  const total = photos.length + (home.showArtwork ? 1 : 0),
    current = index % total;
  const choose = (i: number) => {
    setIndex((i + total) % total);
    setPlaying(false);
  };
  useEffect(() => setPlaying(home.autoplay), [home.autoplay]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.2,
    });
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!playing || !enabled || !visible) return;
    const timer = setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % total);
    }, home.interval * 1000);
    return () => clearInterval(timer);
  }, [playing, enabled, visible, total, current, home.interval]);
  return (
    <div
      ref={root}
      className="home-gallery"
      aria-roledescription="carrusel"
      aria-label="Explora Ingeniería en Sistemas Computacionales"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          choose(current - 1);
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          choose(current + 1);
        }
      }}
    >
      <div className="home-gallery-stage" aria-live={playing && enabled ? 'off' : 'polite'}>
        <AnimatePresence mode="wait">
          <motion.div
            key={
              home.showArtwork && current === 0
                ? 'sistemas'
                : photos[current - (home.showArtwork ? 1 : 0)].id
            }
            className="home-gallery-slide"
            initial={{ opacity: 0, x: enabled ? 25 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: enabled ? -25 : 0 }}
            transition={{ duration: enabled ? 0.45 : 0 }}
          >
            {home.showArtwork && current === 0 ? (
              artwork
            ) : (
              <img
                src={photos[current - (home.showArtwork ? 1 : 0)].url}
                alt={photos[current - (home.showArtwork ? 1 : 0)].alt}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="home-gallery-controls">
        <span className="gallery-position">GALERÍA</span>
        <div className="gallery-dots" role="group" aria-label="Selecciona una imagen">
          {Array.from({ length: total }, (_, i) => (
            <button
              type="button"
              key={i}
              aria-label={
                home.showArtwork && i === 0
                  ? 'Ver visualización de sistemas'
                  : `Ver imagen ${i + (home.showArtwork ? 0 : 1)}`
              }
              aria-pressed={current === i}
              onClick={() => choose(i)}
            />
          ))}
        </div>
        <div className="gallery-arrows">
          <button type="button" aria-label="Imagen anterior" onClick={() => choose(current - 1)}>
            <ArrowLeft size={17} />
          </button>
          <button
            type="button"
            aria-label={playing && enabled ? 'Pausar imágenes' : 'Reproducir imágenes'}
            disabled={!enabled}
            onClick={() => setPlaying((v) => !v)}
          >
            {playing && enabled ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button type="button" aria-label="Imagen siguiente" onClick={() => choose(current + 1)}>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
