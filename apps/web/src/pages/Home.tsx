import { Suspense, lazy, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroCinematic from '../components/hero/HeroCinematic';
import NewsCard from '../components/noticias/NewsCard';
import Reveal from '../components/shared/Reveal';
import SectionEyebrow from '../components/shared/SectionEyebrow';
import { api } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

const CircuitOrb = lazy(() => import('../components/three/CircuitOrb'));

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
  const { data: teachers } = useApiData(() => api.teachers(), []);
  const { data: labs } = useApiData(() => api.labs(), []);
  const { data: subjects } = useApiData(() => api.subjects(), []);
  const [showOrb, setShowOrb] = useState(false);

  useEffect(() => {
    setShowOrb(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const stats = [
    { label: 'Docentes', value: teachers?.length },
    { label: 'Laboratorios', value: labs?.length },
    { label: 'Materias en la retícula', value: subjects?.length },
  ];

  return (
    <div>
      <HeroCinematic slides={slides ?? []} />

      <section className="relative overflow-hidden bg-deep px-6 py-20 text-center text-surface">
        {showOrb && (
          <div className="absolute inset-0 opacity-50">
            <Suspense fallback={null}>
              <CircuitOrb />
            </Suspense>
          </div>
        )}
        <div className="relative mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delayMs={i * 100}>
              <p className="font-mono text-4xl font-bold text-signal">{stat.value ?? '—'}</p>
              <p className="mt-1 text-sm text-line">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

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
