interface PageBannerProps {
  eyebrow: string;
  title: string;
  imageUrl?: string | null;
  imageAlt?: string;
}

/**
 * Encabezado plano de página, estilo Stanford/CMU: una foto real (sin
 * gradientes ni efectos 3D) con una franja oscura al pie donde va el
 * título en blanco, alineado a la izquierda. Pensado para reemplazar el
 * hero cinematográfico con orbe 3D en las páginas de contenido — el
 * lenguaje visual "maximalista" se conserva solo donde de verdad aporta
 * (Home), no en cada apartado.
 *
 * Deliberadamente no usa id="hero-wrapper": el header ya no necesita
 * volverse transparente sobre esta franja, se queda sólido desde el
 * inicio (ver Header.tsx, CINEMATIC_EXACT_ROUTES).
 */
export default function PageBanner({ eyebrow, title, imageUrl, imageAlt }: PageBannerProps) {
  return (
    <section className="relative mt-[72px] h-[320px] w-full overflow-hidden bg-ink sm:h-[380px]">
      {imageUrl && (
        <img src={imageUrl} alt={imageAlt ?? ''} className="h-full w-full object-cover" loading="eager" />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-ink/70 px-6 py-6 sm:px-10 sm:py-8">
        <p className="font-mono text-xs uppercase tracking-widest text-signal">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-bold text-surface sm:text-4xl">{title}</h1>
      </div>
    </section>
  );
}
