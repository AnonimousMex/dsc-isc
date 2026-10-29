import type { Subject } from './types/index.js';

/** An administrator's document takes precedence over the legacy source link. */
export function subjectAcademicUrl(
  subject: Pick<Subject, 'syllabus' | 'academicSourceUrl'>,
): string | null {
  return subject.syllabus?.url || subject.academicSourceUrl || null;
}
