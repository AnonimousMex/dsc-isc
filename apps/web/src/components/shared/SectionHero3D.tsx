import { Suspense, useEffect, useState, type ComponentType, type ReactNode } from 'react';
import Reveal from './Reveal';
import SectionEyebrow from './SectionEyebrow';

interface SectionHero3DProps {
  eyebrow: string;
  title: string;
  description?: string;
  /** Componente 3D (lazy) propio de la página — cada apartado usa una escena distinta. */
  scene: ComponentType;
  children?: ReactNode;
}

/**
 * Encabezado corto y cinematográfico con un acento 3D de fondo, reutilizado
 * al inicio de cada apartado principal del sitio para que todas las
 * secciones abran con la misma presencia visual que ya tenían Oferta
 * Educativa y Laboratorios. La escena 3D en sí (`scene`) la decide cada
 * página para que cada apartado tenga su propia pieza, no la misma repetida.
 */
export default function SectionHero3D({ eyebrow, title, description, scene: Scene, children }: SectionHero3DProps) {
  const [showScene, setShowScene] = useState(false);

  useEffect(() => {
    setShowScene(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  return (
    <section
      id="hero-wrapper"
      className="relative flex min-h-[42svh] flex-col items-center justify-center overflow-hidden bg-deep px-6 py-20 text-center text-surface"
    >
      {showScene && (
        <div className="absolute inset-0 opacity-50">
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </div>
      )}
      <Reveal className="relative">
        {children}
        <SectionEyebrow tone="light">{eyebrow}</SectionEyebrow>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold sm:text-5xl">{title}</h1>
        {description && <p className="mx-auto mt-4 max-w-xl text-sm text-line">{description}</p>}
      </Reveal>
    </section>
  );
}
