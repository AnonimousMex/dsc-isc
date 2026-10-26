import { ArrowDown, ArrowRight, ArrowUpRight, Code2, Cpu, Network } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';
import NewsCard from '../components/noticias/NewsCard';
import TiltSurface from '../components/motion/TiltSurface';
import Reveal from '../components/shared/Reveal';
import CareerLogo from '../components/shared/CareerLogo';
import HomeHeroGallery from '../components/hero/HomeHeroGallery';
import { usePresentation } from '../lib/PresentationContext';

const pathways = [
  {
    title: 'Aprende de quienes crean.',
    text: 'Conoce al cuerpo académico y sus áreas de especialidad, experiencia e investigación.',
    href: '/docentes',
    label: 'Nuestros docentes',
    icon: Code2,
  },
  {
    title: 'Lleva tus ideas a la práctica.',
    text: 'Explora los laboratorios donde el conocimiento se convierte en proyectos.',
    href: '/laboratorios',
    label: 'Explora los laboratorios',
    icon: Cpu,
  },
  {
    title: 'Conecta con tu comunidad.',
    text: 'Residencias profesionales, investigación y actividades que acompañan tu formación.',
    href: '/comunidad',
    label: 'Vida en Sistemas',
    icon: Network,
  },
];

function ComputationalGraphic() {
  return (
    <TiltSurface className="computational-tilt" strength={15}>
      <div className="computational-art" aria-hidden="true">
        <div className="art-coordinate">FIG. PENSAMIENTO COMPUTACIONAL</div>
        <svg viewBox="0 0 600 600" fill="none">
          <defs>
            <linearGradient
              id="circuit"
              x1="100"
              y1="80"
              x2="500"
              y2="540"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--site-primary, #c2dfff)" />
              <stop offset="1" stopColor="var(--site-signal, #99e2ff)" />
            </linearGradient>
          </defs>
          {Array.from({ length: 13 }, (_, i) => (
            <path
              key={i}
              d={`M ${100 + i * 14} ${150 - i * 7} L ${350 + i * 10} ${100 + i * 7} L ${500 - i * 7} ${350 + i * 10} L ${250 - i * 10} ${500 - i * 7} Z`}
              stroke="url(#circuit)"
              strokeWidth="1.1"
              opacity={0.28 + i * 0.045}
            />
          ))}
          <path
            d="M100 150 250 500M350 100 500 350M100 150 500 350M350 100 250 500"
            stroke="var(--site-signal, #99e2ff)"
            strokeOpacity=".25"
          />
          {[
            [100, 150],
            [350, 100],
            [500, 350],
            [250, 500],
          ].map(([x, y]) => (
            <g key={x}>
              <circle cx={x} cy={y} r="6" fill="var(--site-signal, #99e2ff)" />
              <circle
                cx={x}
                cy={y}
                r="13"
                stroke="var(--site-signal, #99e2ff)"
                strokeOpacity=".35"
              />
            </g>
          ))}
        </svg>
        <div className="art-caption">
          <span>PERSONAS → TECNOLOGÍA → SOLUCIONES</span>
          <span>19.72° N / 101.18° O</span>
        </div>
      </div>
    </TiltSurface>
  );
}

export default function Home() {
  const { home } = usePresentation();
  const { data: teachers } = useApiData(() => api.teachers(), []);
  const { data: labs } = useApiData(() => api.labs(), []);
  const { data: subjects } = useApiData(() => api.subjects(), []);
  const { data: slides } = useApiData(() => api.heroSlides(), []);
  const { data: news } = useApiData(() => api.news(), []);
  const stats = [
    { label: 'Docentes', value: teachers?.length, href: '/docentes' },
    { label: 'Laboratorios', value: labs?.length, href: '/laboratorios' },
    {
      label: 'Materias del plan de estudios',
      value: subjects?.length,
      href: '/oferta-educativa/isc#reticula',
    },
  ].filter((stat) => stat.value !== undefined);

  return (
    <div className="home-editorial">
      <section className="systems-hero">
        <div className="hero-grid page-width">
          <div className="hero-copy">
            <p className="section-kicker">
              <span className="status-dot" /> INGENIERÍA EN SISTEMAS COMPUTACIONALES
            </p>
            <h1 className="editable-home-title">
              {home.title}
              <br />
              <span>{home.highlight}</span>
            </h1>
            <p className="hero-description">{home.description}</p>
            <Link to="/oferta-educativa/isc" className="editorial-button">
              {home.button} <ArrowUpRight size={19} />
            </Link>
            <a href="#descubre" className="hero-scroll">
              <ArrowDown size={16} /> Descubre tu siguiente paso
            </a>
          </div>
          <HomeHeroGallery slides={slides ?? []} artwork={<ComputationalGraphic />} />
        </div>
        <div className="hero-bottom page-width">
          <span>INGENIERÍA EN SISTEMAS COMPUTACIONALES</span>
          <span>
            MORELIA, MICHOACÁN <span className="accent-text">↗</span>
          </span>
        </div>
      </section>

      <nav className="resource-strip" aria-label="Accesos para estudiantes">
        <div className="page-width">
          <span>Tu siguiente paso</span>
          {[
            { title: 'Plan de estudios', href: '/oferta-educativa/isc#reticula' },
            { title: 'Especialidades', href: '/especialidades' },
            { title: 'Normateca', href: '/normateca' },
            { title: 'Egresados', href: '/egresados' },
          ].map((item) => (
            <Link key={item.href} to={item.href}>
              {item.title}
              <ArrowUpRight size={16} />
            </Link>
          ))}
        </div>
      </nav>

      <section id="descubre" className="program-feature page-width">
        <div>
          <p className="section-kicker">TU FORMACIÓN</p>
          <h2>
            Una carrera.
            <br />
            Infinitas posibilidades.
          </h2>
          <p className="section-description">
            Ingeniería en Sistemas Computacionales: conoce el programa, explora el plan de estudios
            y encuentra tu área de especialidad.
          </p>
          <Link to="/oferta-educativa/isc" className="text-link">
            Conoce la oferta educativa <ArrowRight size={20} />
          </Link>
        </div>
        <Link to="/oferta-educativa/isc" className="degree-panel">
          <div className="degree-top">
            <span>INGENIERÍA</span>
            <ArrowUpRight size={26} />
          </div>
          <span className="degree-logo">
            <CareerLogo />
          </span>
          <h3>
            Sistemas
            <br />
            Computacionales
          </h3>
          <div className="degree-bottom">
            <span>EXPLORA EL PROGRAMA</span>
            <span>ISC_</span>
          </div>
        </Link>
      </section>

      <section className="discovery-section">
        <div className="page-width">
          <div className="section-heading">
            <div>
              <p className="section-kicker">EL ECOSISTEMA</p>
              <h2>
                Aquí empieza
                <br />
                lo que sigue.
              </h2>
            </div>
            <p>
              Personas, espacios y experiencias
              <br />
              para construir tu camino en Sistemas.
            </p>
          </div>
          <Reveal className="pathways">
            {pathways.map((item) => (
              <Link to={item.href} key={item.href} className="pathway">
                <div className="pathway-top">
                  <item.icon size={42} strokeWidth={1} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <span className="pathway-link">
                  {item.label}
                  <ArrowUpRight size={20} />
                </span>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="academic-stats page-width" aria-label="La carrera en cifras">
          {stats.map((stat) => (
            <Link to={stat.href} key={stat.label}>
              <strong>{stat.value}</strong>
              <span>
                {stat.label}
                <ArrowUpRight size={17} />
              </span>
            </Link>
          ))}
        </section>
      )}

      {news && news.length > 0 && (
        <section className="news-section page-width">
          <div className="section-heading">
            <div>
              <p className="section-kicker">EN LA COMUNIDAD</p>
              <h2>Sistemas en movimiento.</h2>
            </div>
            <Link to="/noticias" className="text-link">
              Todas las noticias <ArrowUpRight size={20} />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {news.slice(0, 3).map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        </section>
      )}

      <section className="community-callout page-width">
        <div>
          <p className="section-kicker">SIGUE CONECTADO</p>
          <h2>
            La tecnología evoluciona.
            <br />
            La comunidad permanece.
          </h2>
        </div>
        <Link to="/egresados" className="editorial-button">
          Conoce a nuestros egresados <ArrowUpRight size={20} />
        </Link>
      </section>
    </div>
  );
}
