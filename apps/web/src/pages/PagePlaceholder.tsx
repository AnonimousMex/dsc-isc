import Reveal from '../components/shared/Reveal';
import SectionEyebrow from '../components/shared/SectionEyebrow';

interface PagePlaceholderProps {
  eyebrow: string;
  title: string;
}

/**
 * Se usa temporalmente en las rutas que aún no tienen su página real
 * construida (llega en fases posteriores). Nunca contenido "quemado" de
 * producción — solo un estado de espera legible durante la construcción.
 */
export default function PagePlaceholder({ eyebrow, title }: PagePlaceholderProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center px-6 py-32">
      <Reveal>
        <SectionEyebrow>{eyebrow}</SectionEyebrow>
        <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
        <p className="mt-4 text-muted">Esta sección está en construcción y se completa en una fase posterior.</p>
      </Reveal>
    </div>
  );
}
