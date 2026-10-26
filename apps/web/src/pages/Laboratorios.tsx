import ChapterSculpture from '../components/motion/ChapterSculpture';
import { usePresentation } from '../lib/PresentationContext';
import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Cpu,
  Maximize2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Lab } from '@dsc-isc/shared';
import Reveal from '../components/shared/Reveal';
import { ContentStatus } from '../components/shared/Editorial';
import TechSculpture from '../components/motion/TechSculpture';
import TiltSurface from '../components/motion/TiltSurface';
import { useMotionSettings } from '../components/motion/MotionExperience';
import { api } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

function LabPreview({ lab }: { lab: Lab }) {
  const [photo, setPhoto] = useState(0);
  const { enabled } = useMotionSettings();
  return (
    <div className="lab-preview">
      <TiltSurface className="lab-preview-visual" strength={5}>
        <div className="lab-photo-stage">
          {lab.gallery.length ? (
            <AnimatePresence mode="wait">
              <motion.img
                key={lab.gallery[photo].id}
                src={lab.gallery[photo].url}
                alt={lab.gallery[photo].alt ?? lab.name}
                initial={{ opacity: 0, scale: enabled ? 1.04 : 1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: enabled ? 0.4 : 0 }}
              />
            </AnimatePresence>
          ) : (
            <div className="lab-concept">
              <TechSculpture compact />
              <span>ILUSTRACIÓN CONCEPTUAL / ISC</span>
            </div>
          )}
          <div className="lab-image-corners" aria-hidden="true" />
          <Link
            to={`/laboratorios/${lab.slug}`}
            className="lab-image-link"
            aria-label={`Ver el detalle de ${lab.name}`}
          >
            <Maximize2 size={16} />
          </Link>
        </div>
      </TiltSurface>
      {lab.gallery.length > 1 && (
        <div className="lab-photo-thumbnails" aria-label="Galería del laboratorio">
          {lab.gallery.map((image, i) => (
            <button
              type="button"
              key={image.id}
              onClick={() => setPhoto(i)}
              aria-label={`Ver fotografía ${i + 1} de ${lab.name}`}
              aria-pressed={photo === i}
            >
              <img src={image.url} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      <div className="lab-preview-information">
        <div>
          <p className="section-kicker">EXPLORA EL ESPACIO</p>
          <h3>{lab.name}</h3>
          <p className="lab-description">{lab.description}</p>
        </div>
        <Link to={`/laboratorios/${lab.slug}`} className="editorial-button">
          Conoce el laboratorio <ArrowUpRight size={19} />
        </Link>
      </div>
      {(lab.equipment.length > 0 || lab.relatedSubjects.length > 0) && (
        <div className="lab-specifications">
          {!!lab.equipment.length && (
            <div>
              <h4>
                <Cpu size={15} /> Equipamiento
              </h4>
              <dl>
                {lab.equipment.slice(0, 4).map((item, i) => (
                  <div key={`${item.label}-${i}`}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {!!lab.relatedSubjects.length && (
            <div>
              <h4>
                <BookOpen size={15} /> Aprendizaje en acción
              </h4>
              <ul>
                {lab.relatedSubjects.slice(0, 5).map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Laboratorios() {
  const { chapters } = usePresentation();
  const { data: labs, loading, error } = useApiData(() => api.labs(), []);
  const [index, setIndex] = useState(0);
  const { enabled } = useMotionSettings();
  const id = useId();
  const current = labs?.length ? index % labs.length : 0;
  const active = labs?.[current];
  const select = (next: number) => setIndex((next + (labs?.length ?? 1)) % (labs?.length ?? 1));
  return (
    <div className="interior-page labs-page labs-immersive">
      <section className="lab-hero">
        <div className="lab-hero-grid page-width">
          <div className="lab-hero-copy">
            <p className="section-kicker">
              <span className="status-dot" /> INGENIERÍA EN SISTEMAS COMPUTACIONALES
            </p>
            <h1>
              Las ideas salen
              <br />
              de la pantalla.
              <br />
              <span>Aquí se construyen.</span>
            </h1>
            <p>
              Laboratorios para explorar, experimentar y convertir lo que aprendes en lo que eres
              capaz de crear.
            </p>
            <a href="#explorar-laboratorios" className="editorial-button">
              Explora los espacios <ArrowDown size={18} />
            </a>
            <div className="lab-hero-caption">
              <span>LABORATORIOS / ISC</span>
              <span className="lab-signal" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
            </div>
          </div>
          <div className="lab-hero-art">
            {chapters.laboratorios === 'chip' ? (
              <TechSculpture />
            ) : chapters.laboratorios === 'none' ? null : (
              <ChapterSculpture kind={chapters.laboratorios} />
            )}
            <span className="lab-art-caption">PENSAMIENTO → EXPERIMENTACIÓN → SOLUCIÓN</span>
          </div>
        </div>
        <div className="lab-hero-baseline page-width">
          <span>APRENDER HACIENDO_</span>
          <span>INGENIERÍA EN SISTEMAS COMPUTACIONALES / ITM</span>
        </div>
      </section>
      <section id="explorar-laboratorios" className="page-width lab-explorer-section">
        <Reveal className="section-heading">
          <div>
            <p className="section-kicker">ENCUENTRA TU ESPACIO</p>
            <h2>
              Elige dónde
              <br />
              dar el siguiente paso.
            </h2>
          </div>
          <p>
            Selecciona un laboratorio para descubrir
            <br />
            sus espacios, equipamiento y materias.
          </p>
        </Reveal>
        <ContentStatus
          loading={loading}
          error={error}
          empty={!labs?.length}
          noun="los laboratorios"
        />
        {active && labs && (
          <div className="lab-explorer">
            <div className="lab-directory">
              <div className="lab-directory-title">
                <span>ESPACIOS</span>
              </div>
              <div
                role="tablist"
                aria-label="Laboratorios"
                aria-orientation="vertical"
                onKeyDown={(event) => {
                  let next = current;
                  if (event.key === 'ArrowDown') next = (current + 1) % labs.length;
                  else if (event.key === 'ArrowUp')
                    next = (current + labs.length - 1) % labs.length;
                  else if (event.key === 'Home') next = 0;
                  else if (event.key === 'End') next = labs.length - 1;
                  else return;
                  event.preventDefault();
                  select(next);
                  event.currentTarget
                    .querySelectorAll<HTMLButtonElement>('[role=tab]')
                    [next]?.focus();
                }}
              >
                {labs.map((lab, i) => (
                  <button
                    type="button"
                    key={lab.id}
                    role="tab"
                    id={`${id}-tab-${i}`}
                    aria-selected={current === i}
                    aria-controls={`${id}-preview`}
                    tabIndex={current === i ? 0 : -1}
                    onClick={() => select(i)}
                  >
                    <span>{lab.name}</span>
                    <ArrowUpRight size={18} />
                  </button>
                ))}
              </div>
              <div className="lab-directory-controls">
                <button
                  type="button"
                  aria-label="Laboratorio anterior"
                  disabled={labs.length < 2}
                  onClick={() => select(current - 1)}
                >
                  <ArrowLeft size={18} />
                </button>
                <span>EXPLORA LOS ESPACIOS</span>
                <button
                  type="button"
                  aria-label="Siguiente laboratorio"
                  disabled={labs.length < 2}
                  onClick={() => select(current + 1)}
                >
                  <ArrowRight size={18} />
                </button>
              </div>
              <p className="lab-directory-note">Cada espacio abre una nueva posibilidad.</p>
            </div>
            <div
              id={`${id}-preview`}
              role="tabpanel"
              aria-labelledby={`${id}-tab-${current}`}
              tabIndex={0}
              className="lab-preview-panel"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: enabled ? 14 : 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: enabled ? 0.25 : 0 }}
                >
                  <LabPreview lab={active} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </section>
      <section className="lab-resource-links page-width">
        <Reveal>
          <Link to="/normateca">
            <span className="section-kicker">ANTES DE COMENZAR</span>
            <h2>
              Un buen proyecto
              <br />
              empieza con buenas prácticas.
            </h2>
            <span className="text-link">
              Consulta el reglamento de laboratorios <ArrowUpRight size={20} />
            </span>
          </Link>
        </Reveal>
        <Reveal delayMs={100}>
          <Link to="/oferta-educativa/isc#reticula">
            <span className="section-kicker">CONECTA LO QUE APRENDES</span>
            <h2>
              De cada materia
              <br />a tu próximo proyecto.
            </h2>
            <span className="text-link">
              Explora el plan de estudios <ArrowUpRight size={20} />
            </span>
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
