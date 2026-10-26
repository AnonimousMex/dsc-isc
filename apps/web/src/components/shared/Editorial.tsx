import type { ReactNode } from 'react';
import { ArrowDown } from 'lucide-react';
import Reveal from './Reveal';
import TiltSurface from '../motion/TiltSurface';

export function EditorialIntro({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Reveal className="editorial-intro">
      <div>
        <p className="section-kicker">EXPLORA SISTEMAS</p>
        <h2>{title}</h2>
      </div>
      <div className="editorial-intro-copy">
        {children}
        <ArrowDown size={20} aria-hidden="true" />
      </div>
    </Reveal>
  );
}

export function ImageStory({
  title,
  image,
  alt,
  reverse = false,
  children,
}: {
  title: string;
  image: string;
  alt: string;
  reverse?: boolean;
  children: ReactNode;
}) {
  return (
    <Reveal
      direction={reverse ? 'right' : 'left'}
      className={`image-story ${reverse ? 'image-story-reverse' : ''}`}
    >
      <TiltSurface className="story-image" strength={6}>
        <img src={image} alt={alt} loading="lazy" />
      </TiltSurface>
      <div className="story-copy">
        <p className="section-kicker">INGENIERÍA EN SISTEMAS COMPUTACIONALES</p>
        <h2>{title}</h2>
        <div className="story-body">{children}</div>
      </div>
    </Reveal>
  );
}

export function ContentStatus({
  loading,
  error,
  empty,
  noun = 'contenido',
}: {
  loading?: boolean;
  error?: Error | null;
  empty: boolean;
  noun?: string;
}) {
  if (loading)
    return (
      <p className="content-status" role="status">
        Cargando {noun}…
      </p>
    );
  if (error)
    return (
      <p className="content-status" role="alert">
        No pudimos cargar {noun}. Intenta de nuevo más tarde.
      </p>
    );
  if (empty)
    return <p className="content-status">Próximamente podrás consultar {noun} en este espacio.</p>;
  return null;
}
