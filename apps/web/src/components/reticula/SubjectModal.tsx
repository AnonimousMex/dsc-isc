import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Subject, TeacherSummary } from '@dsc-isc/shared';

interface SubjectModalProps {
  subject: Subject;
  allSubjects: Subject[];
  teachersById: Record<string, TeacherSummary>;
  onClose: () => void;
  onSelectPrerequisite: (id: string) => void;
}

export default function SubjectModal({
  subject,
  allSubjects,
  teachersById,
  onClose,
  onSelectPrerequisite,
}: SubjectModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const prerequisites = subject.prerequisiteIds
    .map((id) => allSubjects.find((s) => s.id === id))
    .filter((s): s is Subject => Boolean(s));

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
          className="w-full max-w-lg rounded-lg bg-surface p-6"
          role="dialog"
          aria-modal="true"
          aria-label={subject.name}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted">
                {subject.code} · Semestre {subject.semester}
              </p>
              <h3 className="mt-1 text-xl font-bold text-ink">{subject.name}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded p-1 text-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
            >
              ✕
            </button>
          </div>

          <p className="mt-4 text-sm text-muted">{subject.objective}</p>

          {subject.teacherIds.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Docentes</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {subject.teacherIds.map((id) => {
                  const teacher = teachersById[id];
                  if (!teacher) return null;
                  return (
                    <Link
                      key={id}
                      to={`/docentes/${teacher.slug}`}
                      className="rounded-full border border-line px-3 py-1 text-xs text-ink hover:border-primary hover:text-primary"
                    >
                      {teacher.fullName}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {prerequisites.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Prerrequisitos</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {prerequisites.map((prerequisite) => (
                  <button
                    key={prerequisite.id}
                    type="button"
                    onClick={() => onSelectPrerequisite(prerequisite.id)}
                    className="rounded-full border border-line px-3 py-1 text-xs text-ink hover:border-signal hover:text-primary"
                  >
                    {prerequisite.code} · {prerequisite.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
