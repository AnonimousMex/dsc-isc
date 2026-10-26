import { useEffect, useRef, type ReactNode } from 'react';
import { usePresentation } from '../../lib/PresentationContext';
import { useMotionSettings } from './MotionExperience';

export default function TiltSurface({
  children,
  className = '',
  strength = 7,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { motion } = usePresentation();
  const { enabled: playing } = useMotionSettings();
  const enabled = playing && motion.interactive;
  const frame = useRef(0);
  const reset = () => {
    cancelAnimationFrame(frame.current);
    ref.current?.style.setProperty('--tilt-x', '0deg');
    ref.current?.style.setProperty('--tilt-y', '0deg');
    ref.current?.style.setProperty('--pointer-x', '50%');
    ref.current?.style.setProperty('--pointer-y', '50%');
  };
  useEffect(() => {
    if (!enabled) reset();
    return () => cancelAnimationFrame(frame.current);
  }, [enabled]);
  return (
    <div
      className={`tilt-surface ${className}`}
      ref={ref}
      onPointerMove={(e) => {
        if (!enabled || e.pointerType !== 'mouse') return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => {
          ref.current?.style.setProperty('--tilt-x', `${(0.5 - y) * strength}deg`);
          ref.current?.style.setProperty('--tilt-y', `${(x - 0.5) * strength}deg`);
          ref.current?.style.setProperty('--pointer-x', `${x * 100}%`);
          ref.current?.style.setProperty('--pointer-y', `${y * 100}%`);
        });
      }}
      onPointerLeave={reset}
    >
      <div className="tilt-plane">{children}</div>
    </div>
  );
}
