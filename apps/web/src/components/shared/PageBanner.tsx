import TechSculpture from '../motion/TechSculpture';
import { useLocation } from 'react-router-dom';
import { usePresentation } from '../../lib/PresentationContext';
import ChapterSculpture, { chapterFor, type ChapterKind } from '../motion/ChapterSculpture';
interface PageBannerProps {
  eyebrow: string;
  title: string;
  imageUrl?: string | null;
  imageAlt?: string;
  sculpture?: ChapterKind;
}

export default function PageBanner({
  eyebrow,
  title,
  imageUrl,
  imageAlt,
  sculpture,
}: PageBannerProps) {
  const { chapters } = usePresentation();
  const { pathname } = useLocation();
  const route = pathname.split('/')[1];
  const key = route === 'oferta-educativa' ? 'carrera' : route;
  const effect = chapters[key as keyof typeof chapters] ?? sculpture ?? chapterFor(eyebrow);
  return (
    <section className={`page-banner ${imageUrl ? 'has-photo' : ''}`}>
      {imageUrl && <img src={imageUrl} alt={imageAlt ?? ''} className="banner-image" />}
      {effect !== 'none' && (
        <div className="banner-sculpture">
          {effect === 'chip' ? <TechSculpture compact /> : <ChapterSculpture kind={effect} />}
        </div>
      )}
      <div className="page-width banner-content">
        <p className="section-kicker">ISC / {eyebrow}</p>
        <h1>{title}</h1>
        <span className="banner-mark" aria-hidden="true">
          _
        </span>
      </div>
    </section>
  );
}
