import { useDialogFocus } from '../../lib/useDialogFocus';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Globe } from 'lucide-react';
import type { Subject, Teacher } from '@dsc-isc/shared';
import TeacherAvatar from './TeacherAvatar';

interface TeacherModalProps {
  teacher: Teacher;
  subjects: Subject[];
  onClose: () => void;
}

/**
 * Modal de materias y contacto de un docente — no muestra "horario" ni
 * "cubículo" porque el sistema no tiene esa información cargada (nunca se
 * inventan datos de ubicación/horario que un estudiante podría tomar como
 * reales). Si se necesita agendar una asesoría, se usa el correo o sitio
 * del docente.
 */
export default function TeacherModal({ teacher, subjects, onClose }: TeacherModalProps) {
  const { email, website } = teacher;
  const dialogRef = useDialogFocus(onClose);

  return (
    <AnimatePresence>
      <motion.div
        className="editorial-modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4"
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
          className="editorial-modal w-full max-w-md border border-line/20 bg-surface p-6"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={teacher.fullName}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full">
              <TeacherAvatar fullName={teacher.fullName} photo={teacher.photo} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-ink">{teacher.fullName}</h3>
              <p className="text-sm text-muted">{teacher.title}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="ml-auto rounded p-1 text-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
            >
              ✕
            </button>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Materias asignadas
            </p>
            {subjects.length > 0 ? (
              <ul className="mt-2 flex flex-col divide-y divide-line rounded-lg border border-line">
                {subjects.map((subject) => (
                  <li key={subject.id} className="px-3 py-2">
                    <p className="text-sm font-medium text-ink">{subject.name}</p>
                    <p className="font-mono text-xs text-muted">
                      {subject.code} · Semestre {subject.semester}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">Sin materias asignadas por ahora.</p>
            )}
          </div>

          {(email || website) && (
            <div className="mt-5 flex flex-wrap gap-3">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-sm text-ink hover:border-primary hover:text-primary"
                >
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  Correo
                </a>
              )}
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-sm text-ink hover:border-primary hover:text-primary"
                >
                  <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                  Sitio web
                </a>
              )}
            </div>
          )}

          <Link
            to={`/docentes/${teacher.slug}`}
            className="mt-5 block text-center text-sm font-medium text-primary hover:underline"
          >
            Ver perfil completo
          </Link>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
