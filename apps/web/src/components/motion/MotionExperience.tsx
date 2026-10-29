import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { usePresentation } from '../../lib/PresentationContext';

const MotionSettings = createContext({ enabled: true });
export const useMotionSettings = () => useContext(MotionSettings);

function AmbientNetwork({ enabled }: { enabled: boolean }) {
  const { colors, motion } = usePresentation();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const rgb = parseInt(colors.signal.slice(1), 16);
    const tone = `${(rgb >> 16) & 255},${(rgb >> 8) & 255},${rgb & 255}`;
    let width = 0,
      height = 0,
      frame = 0,
      previous = 0,
      time = 0;
    const pointer = { x: -1000, y: -1000 };
    const nodes = Array.from({ length: 44 }, (_, i) => ({
      x: ((i * 137.508) % 100) / 100,
      y: ((i * 73.13 + 17) % 100) / 100,
      depth: 0.3 + (i % 5) / 7,
      phase: i * 1.7,
    }));
    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint(0);
    }
    function paint(delta: number) {
      time += delta;
      ctx!.clearRect(0, 0, width, height);
      const positions = nodes.slice(0, width < 700 ? 24 : 44).map((n) => ({
        x: n.x * width + Math.sin(time * 0.00015 + n.phase) * 25 * n.depth,
        y: n.y * height + Math.cos(time * 0.00012 + n.phase) * 30 * n.depth,
        depth: n.depth,
      }));
      for (let i = 0; i < positions.length; i++) {
        const a = positions[i];
        for (let j = i + 1; j < positions.length; j++) {
          const b = positions[j],
            distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > 220) continue;
          ctx!.strokeStyle = `rgba(${tone},${(1 - distance / 220) * 0.52})`;
          ctx!.lineWidth = 1.1;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
          if (enabled) {
            const progress = (time * 0.00022 + i * 0.13 + j * 0.07) % 1;
            ctx!.fillStyle = `rgba(${tone},${(1 - distance / 220) * 0.95})`;
            ctx!.beginPath();
            ctx!.arc(a.x + (b.x - a.x) * progress, a.y + (b.y - a.y) * progress, 2, 0, Math.PI * 2);
            ctx!.fill();
          }
        }
        const distance = Math.hypot(a.x - pointer.x, a.y - pointer.y);
        if (enabled && distance < 200) {
          ctx!.strokeStyle = `rgba(${tone},${(1 - distance / 200) * 0.95})`;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(pointer.x, pointer.y);
          ctx!.stroke();
        }
        ctx!.fillStyle = `rgba(${tone},${0.45 + a.depth * 0.45})`;
        ctx!.beginPath();
        ctx!.arc(a.x, a.y, 1.2 + a.depth, 0, Math.PI * 2);
        ctx!.fill();
      }
    }
    function tick(now: number) {
      frame = requestAnimationFrame(tick);
      if (now - previous < 33) return;
      paint(Math.min(now - previous, 60));
      previous = now;
    }
    function visibility() {
      cancelAnimationFrame(frame);
      if (enabled && !document.hidden) {
        previous = performance.now();
        frame = requestAnimationFrame(tick);
      }
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
      }
    };
    const leave = () => {
      pointer.x = -1000;
      pointer.y = -1000;
    };
    resize();
    visibility();
    window.addEventListener('resize', resize);
    if (enabled) window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [enabled, colors.signal]);
  return (
    <canvas
      ref={ref}
      className={`ambient-network network-${motion.intensity}`}
      aria-hidden="true"
    />
  );
}

export default function MotionExperience({ children }: { children: ReactNode }) {
  const { motion } = usePresentation();
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  const [preference, setPreference] = useState<'playing' | 'paused' | null>(() => {
    try {
      const saved = localStorage.getItem('isc:motion');
      return saved === 'playing' || saved === 'paused' ? saved : null;
    } catch {
      return null;
    }
  });
  const enabled = motion.enabled && (preference === 'playing' || (preference === null && !reduced));
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute('data-motion');
    root.setAttribute('data-motion', enabled ? 'playing' : 'paused');
    return () => {
      if (previous === null) root.removeAttribute('data-motion');
      else root.setAttribute('data-motion', previous);
    };
  }, [enabled]);
  function toggle() {
    const next = enabled ? 'paused' : 'playing';
    setPreference(next);
    try {
      localStorage.setItem('isc:motion', next);
    } catch {
      /* La preferencia funciona sin almacenamiento. */
    }
  }
  return (
    <MotionSettings.Provider value={{ enabled }}>
      {/* Components use the live motion context; Framer caches reducedMotion on mount. */}
      <MotionConfig reducedMotion="never" transition={enabled ? undefined : { duration: 0 }}>
        <div
          className="experience-root"
          data-motion={enabled ? 'playing' : 'paused'}
          data-logos={motion.logos ? 'playing' : 'paused'}
          data-reveal={motion.reveal ? 'on' : 'off'}
        >
          {motion.background && <AmbientNetwork enabled={enabled} />}
          <div className="experience-content">
            {children}
            <button
              type="button"
              className="motion-toggle"
              onClick={toggle}
              disabled={!motion.enabled}
              aria-pressed={enabled}
              title={
                !motion.enabled
                  ? 'Las animaciones están desactivadas en la configuración del portal'
                  : reduced && preference === null
                    ? 'Tu dispositivo prefiere movimiento reducido. Puedes activar las animaciones aquí.'
                    : undefined
              }
              aria-label={
                !motion.enabled
                  ? 'Movimiento desactivado por el administrador'
                  : enabled
                    ? 'Pausar animaciones decorativas'
                    : 'Activar animaciones decorativas'
              }
            >
              {enabled ? <Pause size={13} /> : <Play size={13} />}
              <span>
                {!motion.enabled
                  ? 'Movimiento desactivado'
                  : enabled
                    ? 'Pausar movimiento'
                    : 'Activar movimiento'}
              </span>
            </button>
          </div>
        </div>
      </MotionConfig>
    </MotionSettings.Provider>
  );
}
