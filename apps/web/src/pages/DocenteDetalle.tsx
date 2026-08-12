import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Facebook, Globe, Linkedin, Mail, Play, Twitter } from 'lucide-react';
import TeacherAvatar from '../components/docentes/TeacherAvatar';
import VideoModal from '../components/docentes/VideoModal';
import Reveal from '../components/shared/Reveal';
import SectionEyebrow from '../components/shared/SectionEyebrow';
import { api } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

export default function DocenteDetalle() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: teacher, loading, error } = useApiData(() => api.teacher(slug), [slug]);
  const { data: allSubjects } = useApiData(() => api.subjects(), []);
  const [videoOpen, setVideoOpen] = useState(false);

  if (loading) return null;

  if (error || !teacher) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center px-6 py-32">
        <SectionEyebrow>Docentes</SectionEyebrow>
        <h1 className="mt-3 text-3xl font-bold text-ink">Docente no encontrado</h1>
      </div>
    );
  }

  const subjects = (allSubjects ?? []).filter((subject) => teacher.subjectIds.includes(subject.id));

  const contactLinks = [
    { href: teacher.email ? `mailto:${teacher.email}` : null, icon: Mail, label: 'Correo' },
    { href: teacher.website, icon: Globe, label: 'Sitio web' },
    { href: teacher.linkedin, icon: Linkedin, label: 'LinkedIn' },
    { href: teacher.facebook, icon: Facebook, label: 'Facebook' },
    { href: teacher.twitter, icon: Twitter, label: 'X' },
  ].filter((link) => Boolean(link.href));

  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <Reveal>
        <SectionEyebrow>Docentes</SectionEyebrow>
      </Reveal>

      <div className="mt-6 grid gap-8 sm:grid-cols-[200px_1fr]">
        <Reveal>
          <button
            type="button"
            onClick={() => teacher.youtubeUrl && setVideoOpen(true)}
            disabled={!teacher.youtubeUrl}
            className="group relative block aspect-square w-full overflow-hidden rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
            aria-label={teacher.youtubeUrl ? `Reproducir video de ${teacher.fullName}` : undefined}
          >
            <TeacherAvatar fullName={teacher.fullName} photo={teacher.photo} />
            {teacher.youtubeUrl && (
              <span className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/40">
                <Play className="h-10 w-10 text-surface opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
            )}
          </button>
        </Reveal>

        <Reveal delayMs={80}>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">{teacher.fullName}</h1>
          <p className="mt-1 text-muted">{teacher.title}</p>

          {contactLinks.length > 0 && (
            <div className="mt-4 flex gap-3">
              {contactLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href!}
                  target={label === 'Correo' ? undefined : '_blank'}
                  rel="noreferrer"
                  aria-label={label}
                  className="rounded-full border border-line p-2 text-muted hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}

          <p className="mt-6 text-sm text-muted">{teacher.bio}</p>
        </Reveal>
      </div>

      <Reveal delayMs={120} className="mt-12">
        <h2 className="text-lg font-bold text-ink">Experiencia</h2>
        <p className="mt-2 text-sm text-muted">{teacher.experience}</p>
      </Reveal>

      {subjects.length > 0 && (
        <Reveal delayMs={160} className="mt-12">
          <h2 className="text-lg font-bold text-ink">Materias que imparte</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <span key={subject.id} className="rounded-full border border-line px-3 py-1 text-xs text-ink">
                {subject.code} · {subject.name}
              </span>
            ))}
          </div>
        </Reveal>
      )}

      {videoOpen && teacher.youtubeUrl && (
        <VideoModal
          youtubeUrl={teacher.youtubeUrl}
          title={`Video de ${teacher.fullName}`}
          onClose={() => setVideoOpen(false)}
        />
      )}
    </div>
  );
}
