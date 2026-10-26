import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Cpu, Network, Database, Layers, ArrowUpRight } from 'lucide-react';
import type { Subject } from '@dsc-isc/shared';
import { useMotionSettings } from '../motion/MotionExperience';
import ChapterSculpture from '../motion/ChapterSculpture';

const domains = [
  {
    title: 'Arquitectura y hardware',
    icon: Cpu,
    text: 'Comprende cómo funcionan los componentes de un sistema computacional y cómo se relacionan sus capacidades, arquitectura y desempeño.',
    match: /arquitect|hardware|digital|electr|micro|ensambl/,
  },
  {
    title: 'Redes e infraestructura',
    icon: Network,
    text: 'Explora cómo se comunican los sistemas, cómo se organiza su infraestructura y qué hace posible que la información llegue de forma confiable.',
    match: /redes|red |conmuta|telecom|enrut|operativ|distribuid/,
  },
  {
    title: 'Datos e inteligencia',
    icon: Database,
    text: 'Relaciona la organización de datos, su análisis y los modelos computacionales con la toma de decisiones y la solución de problemas.',
    match: /datos|inteligencia|probabilidad|estadistic|matematic|simulaci/,
  },
  {
    title: 'Software y soluciones',
    icon: Layers,
    text: 'Integra análisis, diseño, desarrollo y evaluación de software para atender necesidades de personas, organizaciones y su entorno.',
    match: /software|programaci|algorit|web|aplicaci|ingenieria/,
  },
];
export default function SystemsExplorer({ subjects }: { subjects: Subject[] }) {
  const [active, setActive] = useState(0);
  const { enabled } = useMotionSettings();
  const id = useId();
  const domain = domains[active];
  const related = subjects
    .filter((s) =>
      domain.match.test(
        s.name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase(),
      ),
    )
    .slice(0, 4);
  return (
    <div className="systems-explorer">
      <div className="systems-explorer-heading">
        <div>
          <p className="section-kicker">UNA VISIÓN INTEGRAL</p>
          <h2>
            Un sistema es más
            <br />
            que sus partes.
          </h2>
        </div>
        <p>
          Explora cómo se conectan las distintas áreas de Ingeniería en Sistemas Computacionales.
        </p>
      </div>
      <div
        role="tablist"
        aria-label="Áreas de los sistemas computacionales"
        className="systems-domain-tabs"
        onKeyDown={(e) => {
          let next = active;
          if (e.key === 'ArrowRight') next = (active + 1) % 4;
          else if (e.key === 'ArrowLeft') next = (active + 3) % 4;
          else if (e.key === 'Home') next = 0;
          else if (e.key === 'End') next = 3;
          else return;
          e.preventDefault();
          setActive(next);
          e.currentTarget.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
        }}
      >
        {domains.map((d, i) => (
          <button
            type="button"
            role="tab"
            key={d.title}
            id={`${id}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
          >
            <d.icon size={26} strokeWidth={1} />

            <strong>{d.title}</strong>
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${active}`}
        tabIndex={0}
        className="systems-domain-panel"
      >
        <div className="systems-domain-art">
          <ChapterSculpture
            kind={
              ['systems', 'community', 'faculty', 'resources'][active] as
                'systems' | 'community' | 'faculty' | 'resources'
            }
          />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: enabled ? 15 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: enabled ? 0.25 : 0 }}
          >
            <p className="section-kicker">EXPLORA ESTA ÁREA</p>
            <h3>{domain.title}</h3>
            <p>{domain.text}</p>
            {related.length > 0 && (
              <div className="domain-subjects">
                <span>MATERIAS DEL PLAN DE ESTUDIOS</span>
                {related.map((subject) => (
                  <a href="#reticula" key={subject.id}>
                    {subject.name}
                    <ArrowUpRight size={13} />
                  </a>
                ))}
              </div>
            )}
            <a href="#reticula" className="text-link">
              Conoce el plan completo <ArrowUpRight size={18} />
            </a>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
