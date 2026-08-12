import { Link } from 'react-router-dom';
import HeroCinematic from '../components/hero/HeroCinematic';
import NewsCard from '../components/noticias/NewsCard';
import Reveal from '../components/shared/Reveal';
import SectionEyebrow from '../components/shared/SectionEyebrow';
import { api } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

const gateways = [
  {
    title: '¿Quiénes somos?',
    description: 'Historia, misión, visión y valores del departamento.',
    href: '/nosotros',
  },
  {
    title: 'Oferta educativa',
    description: 'El plan de estudios de Ingeniería en Sistemas Computacionales.',
    href: '/oferta-educativa/isc',
  },
  {
    title: 'Docentes',
    description: 'El cuerpo académico que forma a nuestros estudiantes.',
    href: '/docentes',
  },
  {
    title: 'Laboratorios',
    description: 'Los espacios donde la teoría se vuelve práctica.',
    href: '/laboratorios',
  },
];

export default function Home() {
  const { data: slides } = useApiData(() => api.heroSlides(), []);
  const { data: news } = useApiData(() => api.news(), []);

  return (
    <div>
      <HeroCinematic slides={slides ?? []} />

      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <SectionEyebrow>Explora</SectionEyebrow>
        </Reveal>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {gateways.map((gateway, i) => (
            <Reveal key={gateway.href} delayMs={i * 80}>
              <Link
                to={gateway.href}
                className="group block h-full rounded-lg border border-line bg-surface p-6 transition-shadow hover:shadow-md"
              >
                <h2 className="text-lg font-bold text-ink group-hover:text-primary">{gateway.title}</h2>
                <p className="mt-2 text-sm text-muted">{gateway.description}</p>
                <span className="mt-4 inline-block text-sm font-medium text-accent underline decoration-transparent underline-offset-4 transition-all group-hover:decoration-accent">
                  Ver más
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {news && news.length > 0 && (
        <section className="border-t border-line bg-elevated px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <SectionEyebrow>Noticias</SectionEyebrow>
            </Reveal>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((item, i) => (
                <Reveal key={item.id} delayMs={i * 80}>
                  <NewsCard news={item} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
