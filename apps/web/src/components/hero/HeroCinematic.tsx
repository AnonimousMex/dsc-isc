import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { HeroSlide } from '@dsc-isc/shared';
import ScrollCue from './ScrollCue';

gsap.registerPlugin(ScrollTrigger);

const LOCK_KEY = 'dsc-hero-locked';
// Cuánto se solapan dos slides consecutivos al hacer scroll (crossfade),
// como fracción del recorrido propio de cada slide.
const OVERLAP = 0.4;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

interface HeroCinematicProps {
  slides: HeroSlide[];
}

/**
 * Hero cinematográfico con scroll-lock de un solo uso (sección 10.1 del
 * documento de producto — el componente de mayor riesgo técnico del sitio).
 *
 * Cómo funciona:
 * 1. El wrapper mide `slides.length * 100vh` de alto; adentro, un panel con
 *    `position: sticky; top: 0; height: 100vh` se queda fijo en pantalla
 *    mientras se recorre ese alto (sticky puro de CSS, sin necesitar el
 *    plugin de "pin" de GSAP — más simple y sin los efectos secundarios de
 *    un pin-spacer).
 * 2. Un único ScrollTrigger "maestro" (trigger = wrapper completo) reporta
 *    `self.progress` de 0 a 1 a medida que se cruza ese alto. En cada
 *    actualización, `applyFrame` calcula opacidad/escala/parallax de cada
 *    slide a partir de ese único progreso — no hay un ScrollTrigger por
 *    slide, para evitar animaciones que se pisen entre sí.
 * 3. Cada slide anima scale 0.7→1.2 (efecto Ken Burns continuo) y opacidad
 *    0→1→0 en forma de "tienda de campaña" (fade in, sostenido, fade out
 *    mientras el siguiente slide entra) a lo largo de su propio segmento
 *    de progreso, con un solape (`OVERLAP`) para que el crossfade se sienta
 *    continuo en vez de un corte brusco.
 * 4. En cuanto `progress >= 0.999` por primera vez, `lockHero()` congela el
 *    último slide en su estado neutro (scale 1, opacity 1, y 0), oculta el
 *    resto, mata el ScrollTrigger y marca el candado en `sessionStorage`.
 *    De ahí en adelante el componente ya no vuelve a escuchar el scroll:
 *    si el usuario sube y baja de nuevo, ve el frame final estático, nunca
 *    repite el efecto — así se documenta el "de un solo uso".
 * 5. Si `prefers-reduced-motion` está activo, se salta todo lo anterior y
 *    se monta directo en el estado final (sección 5.4/10.6).
 */
export default function HeroCinematic({ slides }: HeroCinematicProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [locked, setLocked] = useState(() => sessionStorage.getItem(LOCK_KEY) === '1');

  useEffect(() => {
    if (locked || slides.length === 0) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sessionStorage.setItem(LOCK_KEY, '1');
      setLocked(true);
      return;
    }

    const n = slides.length;

    const applyFrame = (progress: number) => {
      slideRefs.current.forEach((el, i) => {
        if (!el) return;
        const segStart = i / n;
        const segLen = 1 / n;
        const local = (progress - segStart) / segLen; // progreso relativo a ESTE slide

        let opacity: number;
        if (local < 0) opacity = clamp((local + OVERLAP) / OVERLAP, 0, 1);
        else if (local <= 1) opacity = 1;
        else opacity = clamp(1 - (local - 1) / OVERLAP, 0, 1);

        // El zoom (Ken Burns) recorre su propia ventana [inicio, fin], pero
        // esa ventana se recorta a los límites reales de scroll (0..1) —
        // así el primer slide arranca exactamente en scale 0.7 al cargar la
        // página, en vez de "ya venir zoomeado" por un solape que nunca
        // ocurrió antes de progress=0.
        const windowStart = Math.max(0, segStart - OVERLAP * segLen);
        const windowEnd = Math.min(1, segStart + segLen + OVERLAP * segLen);
        const zoomT = clamp((progress - windowStart) / (windowEnd - windowStart), 0, 1);
        const scale = 0.7 + 0.5 * zoomT; // 0.7 -> 1.2
        const y = 30 - 60 * zoomT; // parallax: deriva vertical sutil

        gsap.set(el, { opacity, scale, y });
      });
    };

    const lockHero = () => {
      slideRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { opacity: i === n - 1 ? 1 : 0, scale: 1, y: 0 });
      });
      sessionStorage.setItem(LOCK_KEY, '1');
      setLocked(true);
    };

    let hasLocked = false;
    const trigger = ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        applyFrame(self.progress);
        if (!hasLocked && self.progress >= 0.999) {
          hasLocked = true;
          lockHero();
        }
      },
    });

    applyFrame(0);

    return () => trigger.kill();
  }, [slides, locked]);

  if (slides.length === 0) return null;

  return (
    <div
      id="hero-wrapper"
      ref={wrapperRef}
      style={{ height: locked ? '100svh' : `${slides.length * 100}svh` }}
      className="relative"
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-deep">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className="absolute inset-0"
            style={
              locked
                ? { opacity: i === slides.length - 1 ? 1 : 0, transform: 'scale(1) translateY(0px)' }
                : undefined
            }
          >
            <img
              src={slide.media.url}
              alt={slide.media.alt ?? ''}
              className="h-full w-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'auto'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep/85 via-deep/20 to-deep/50" />
            <p className="absolute bottom-10 left-6 font-mono text-xs uppercase tracking-widest text-signal sm:left-12">
              {slide.captionCode}
            </p>
          </div>
        ))}

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-surface">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-signal">
            Instituto Tecnológico de Morelia
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold sm:text-6xl">
            Departamento de Sistemas y Computación
          </h1>
        </div>

        {!locked && <ScrollCue />}
      </div>
    </div>
  );
}
