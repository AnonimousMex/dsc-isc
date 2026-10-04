import { useRef, useState, type MouseEvent } from 'react';

const MAX_TILT_DEG = 10;

/**
 * Inclinación 3D por posición del mouse (sección 10.5), extraída de
 * LabTiltCard para reutilizarse en cualquier tarjeta (Laboratorios,
 * Especialidades). Se desactiva por completo con prefers-reduced-motion.
 */
export function useTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMouseMove = (event: MouseEvent<T>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -MAX_TILT_DEG * 2, y: px * MAX_TILT_DEG * 2 });
  };

  const onMouseLeave = () => setTilt({ x: 0, y: 0 });

  const style = {
    transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
    transition: 'transform 150ms ease-out',
  };

  return { ref, style, onMouseMove, onMouseLeave };
}
