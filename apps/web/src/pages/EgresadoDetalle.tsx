import { Link, useParams } from 'react-router-dom';
import GraduateAvatar from '../components/egresados/GraduateAvatar';
import EmailContact from '../components/shared/EmailContact';
import { api } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

export default function EgresadoDetalle() {
  const { id = '' } = useParams();
  const { data: graduate, loading, error } = useApiData(() => api.graduate(id), [id]);
  if (loading)
    return (
      <p role="status" className="px-6 py-32 text-center text-muted">
        Cargando perfil…
      </p>
    );
  if (error || !graduate)
    return (
      <div className="mx-auto max-w-4xl px-6 py-32">
        <h1 className="text-3xl font-bold text-ink">Perfil no disponible</h1>
        <Link to="/egresados" className="mt-4 inline-block text-accent underline">
          Volver a egresados
        </Link>
      </div>
    );
  return (
    <div className="detail-editorial page-width">
      <Link to="/egresados" className="text-sm text-accent underline">
        ← Comunidad de egresados
      </Link>
      <div className="mt-8 grid gap-8 sm:grid-cols-[240px_1fr]">
        <div className="aspect-square overflow-hidden rounded-lg">
          <GraduateAvatar graduate={graduate} />
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            Egresado verificado · ISC
          </p>
          <h1 className="mt-3 break-words text-3xl font-bold text-ink">{graduate.fullName}</h1>
          <p className="mt-3 break-words text-lg text-muted">{graduate.headline}</p>
          <p className="mt-2 text-sm text-muted">
            Titulación {graduate.graduationYear}
            {graduate.city ? ` · ${graduate.city}` : ''}
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-accent">
            {graduate.email && <EmailContact key={graduate.email} email={graduate.email} />}
            {(['website', 'linkedin', 'github', 'facebook', 'instagram'] as const).map(
              (key) =>
                graduate[key] && (
                  <a
                    key={key}
                    href={graduate[key]!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {
                      {
                        website: 'Sitio web',
                        linkedin: 'LinkedIn',
                        github: 'GitHub',
                        facebook: 'Facebook',
                        instagram: 'Instagram',
                      }[key]
                    }
                  </a>
                ),
            )}
          </div>
          {graduate.curriculumUrl && (
            <a href={graduate.curriculumUrl} className="btn-primary mt-6 inline-flex">
              Descargar currículum
            </a>
          )}
        </div>
      </div>
      <section className="mt-12">
        <h2 className="text-xl font-bold text-ink">Sobre mí</h2>
        <p className="mt-4 whitespace-pre-wrap break-words text-muted">{graduate.bio}</p>
      </section>
      {graduate.experience && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">Experiencia profesional</h2>
          <p className="mt-4 whitespace-pre-wrap break-words text-muted">{graduate.experience}</p>
        </section>
      )}
    </div>
  );
}
