import { usePresentation } from '../../lib/PresentationContext';
import { useMotionSettings } from '../motion/MotionExperience';
import { useEffect, useRef, useState, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  direction?: 'up' | 'left' | 'right';
}

/**
 * Aparece una sola vez al entrar en viewport (sección 5.4) — nunca se
 * re-anima al re-scrollear. Si prefers-reduced-motion está activo, se
 * muestra directo en su estado final sin observar el scroll.
 */
export default function Reveal({
  children,
  className = '',
  delayMs = 0,
  direction = 'up',
}: RevealProps) {
  const { motion } = usePresentation();
  const { enabled: playing } = useMotionSettings();
  const enabled = playing && motion.reveal;
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (!enabled) {
      setVisible(true);
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timeout = setTimeout(() => setVisible(true), delayMs);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [delayMs, enabled]);

  return (
    <div
      ref={ref}
      data-reveal={direction}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
