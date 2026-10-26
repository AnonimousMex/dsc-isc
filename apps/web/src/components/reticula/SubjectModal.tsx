import { useEffect, useId, useState } from 'react';
import { useMotionSettings } from '../motion/MotionExperience';
import { useDialogFocus } from '../../lib/useDialogFocus';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Subject, TeacherSummary } from '@dsc-isc/shared';

interface SubjectModalProps {
  subject: Subject;
  allSubjects: Subject[];
  teachersById: Record<string, TeacherSummary>;
  onClose: () => void;
  onSelectPrerequisite: (id: string) => void;
}
const tabs = ['Carga académica', 'Prerrequisitos', 'Docentes'];
export default function SubjectModal({
  subject,
  allSubjects,
  teachersById,
  onClose,
  onSelectPrerequisite,
}: SubjectModalProps) {
  const dialogRef = useDialogFocus(onClose);
  const { enabled: animate } = useMotionSettings();
  const [tab, setTab] = useState(0);
  const uid = useId();
  useEffect(() => setTab(0), [subject.id]);
  const prerequisites = allSubjects.filter((s) => subject.prerequisiteIds.includes(s.id));
  const teachers = subject.teacherIds.map((id) => teachersById[id]).filter(Boolean);
  return (
    <motion.div
      className="editorial-modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4"
      initial={animate ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        className="editorial-modal w-full max-w-2xl border border-line/20 bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              {subject.code} · Semestre {subject.semester}
            </p>
            <h3 id={`${uid}-title`} className="mt-2 text-xl font-bold text-ink">
              {subject.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded p-2 text-muted hover:text-ink"
          >
            ✕
          </button>
        </div>
        <div
          role="tablist"
          aria-label="Información de la materia"
          className="mt-6 flex gap-2 border-b border-line/20 pb-3"
        >
          {tabs.map((label, index) => (
            <button
              key={label}
              type="button"
              role="tab"
              id={`${uid}-tab-${index}`}
              aria-selected={tab === index}
              aria-controls={`${uid}-panel-${index}`}
              tabIndex={tab === index ? 0 : -1}
              className={`rounded px-3 py-2 text-sm ${tab === index ? 'bg-primary text-deep' : 'text-muted hover:text-primary'}`}
              onClick={() => setTab(index)}
              onKeyDown={(e) => {
                const next =
                  e.key === 'ArrowRight'
                    ? (index + 1) % 3
                    : e.key === 'ArrowLeft'
                      ? (index + 2) % 3
                      : e.key === 'Home'
                        ? 0
                        : e.key === 'End'
                          ? 2
                          : null;
                if (next !== null) {
                  e.preventDefault();
                  setTab(next);
                  document.getElementById(`${uid}-tab-${next}`)?.focus();
                }
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id={`${uid}-panel-${tab}`}
          aria-labelledby={`${uid}-tab-${tab}`}
          tabIndex={0}
          className="min-h-52 py-5"
        >
          {tab === 0 && (
            <>
              <p className="text-sm leading-relaxed text-muted">
                {subject.objective || 'El objetivo de esta materia está pendiente de publicación.'}
              </p>
              <dl className="mt-5 grid grid-cols-3 gap-3">
                {[
                  ['Créditos', subject.credits],
                  ['Horas teóricas', subject.theoryHours],
                  ['Horas prácticas', subject.practicalHours],
                ].map(([label, value]) => (
                  <div key={label} className="rounded border border-line/20 p-3">
                    <dt className="text-xs text-muted">{label}</dt>
                    <dd className="mt-2 text-2xl font-semibold text-primary">{value ?? '—'}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs text-muted">
                Las horas corresponden a la carga semanal. Los campos con — están pendientes de
                publicación.
              </p>
              <div className="mt-5 flex flex-wrap gap-4 text-sm text-primary">
                {subject.syllabus && (
                  <a
                    href={subject.syllabus.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Descargar temario PDF ↗
                  </a>
                )}
                {subject.academicSourceUrl && (
                  <a
                    href={subject.academicSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Consultar fuente académica ↗
                  </a>
                )}
              </div>
            </>
          )}
          {tab === 1 && (
            <>
              <p className="text-sm text-muted">
                {subject.prerequisitesVerified
                  ? prerequisites.length
                    ? 'Materias previas confirmadas para esta asignatura.'
                    : 'No se han registrado prerrequisitos para esta materia.'
                  : 'Pendiente de verificación académica. Las relaciones mostradas son orientativas; confirma los requisitos de inscripción con la coordinación.'}
              </p>
              <div className="mt-5 flex flex-col gap-2">
                {prerequisites.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelectPrerequisite(s.id)}
                    className="rounded border border-line/20 p-3 text-left text-sm text-ink hover:border-primary hover:text-primary"
                  >
                    {s.code} · {s.name} ↗
                  </button>
                ))}
              </div>
            </>
          )}
          {tab === 2 && (
            <>
              <p className="text-sm text-muted">
                {teachers.length
                  ? 'Consulta el perfil de los docentes vinculados a esta materia. La asignación por grupo y periodo se confirma con la coordinación.'
                  : 'Aún no hay docentes publicados para esta materia. Consulta la asignación vigente con la coordinación.'}
              </p>
              <div className="mt-5 flex flex-col gap-2">
                {teachers.map((t) => (
                  <Link
                    key={t.id}
                    to={`/docentes/${t.slug}`}
                    className="rounded border border-line/20 p-3 text-sm text-ink hover:border-primary hover:text-primary"
                  >
                    {t.fullName} ↗
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
