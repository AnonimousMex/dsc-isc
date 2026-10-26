import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { graduateRegistrationSchema } from '@dsc-isc/shared';
import { registerGraduate } from '../lib/apiClient';
import SectionEyebrow from '../components/shared/SectionEyebrow';

const inputClass =
  'w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal';
const initialForm = {
  fullName: '',
  email: '',
  graduationYear: String(new Date().getFullYear()),
  headline: '',
  bio: '',
  experience: '',
  city: '',
  website: '',
  linkedin: '',
  github: '',
  facebook: '',
  instagram: '',
  showEmail: false,
  consent: false,
};

export default function RegistroEgresado() {
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState<{ diploma?: File; photo?: File; curriculum?: File }>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setError(null);
    const parsed = graduateRegistrationSchema.safeParse({
      ...form,
      graduationYear: Number(form.graduationYear),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisa los datos');
      return;
    }
    if (!files.diploma) {
      setError('Adjunta tu título para verificar tu titulación');
      return;
    }
    for (const [kind, file] of Object.entries(files)) {
      if (file && file.size > (kind === 'photo' ? 5 : 15) * 1024 * 1024) {
        setError(
          `El archivo ${kind === 'photo' ? 'de foto' : kind === 'diploma' ? 'del título' : 'del currículum'} excede ${kind === 'photo' ? 5 : 15} MB`,
        );
        return;
      }
    }
    setBusy(true);
    try {
      const body = new FormData();
      body.append('profile', JSON.stringify(parsed.data));
      for (const [kind, file] of Object.entries(files)) if (file) body.append(kind, file);
      const result = await registerGraduate(body);
      setSuccess(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la solicitud');
    } finally {
      setBusy(false);
    }
  };

  const textField = (
    key: keyof typeof initialForm,
    label: string,
    required = false,
    type = 'text',
    maxLength = 160,
  ) => (
    <label className="flex flex-col gap-2 text-sm font-medium text-ink" htmlFor={`graduate-${key}`}>
      {label}
      {required ? ' *' : ''}
      <input
        id={`graduate-${key}`}
        name={key}
        className={inputClass}
        type={type}
        required={required}
        value={String(form[key])}
        maxLength={maxLength}
        min={type === 'number' ? 1950 : undefined}
        max={type === 'number' ? new Date().getFullYear() : undefined}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </label>
  );

  return (
    <div className="registration-page page-width">
      <Link to="/egresados" className="text-sm text-accent underline">
        ← Volver a egresados
      </Link>
      <SectionEyebrow>Soy un egresado</SectionEyebrow>
      <h1 className="mt-3 text-3xl font-bold text-ink">Comparte tu trayectoria</h1>
      <p className="mt-4 text-muted">
        Si ya te titulaste de Ingeniería en Sistemas Computacionales, regístrate para formar parte
        de nuestra comunidad. El departamento revisará tu título antes de publicar tu perfil.
      </p>
      {success ? (
        <div role="status" className="mt-10 rounded-lg border border-primary bg-elevated p-6">
          <h2 className="text-xl font-bold text-ink">Solicitud enviada</h2>
          <p className="mt-3 text-muted">{success}</p>
          <Link to="/egresados" className="mt-5 inline-block text-accent underline">
            Ver comunidad de egresados
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-10">
          <fieldset disabled={busy} className="space-y-8 disabled:opacity-70">
            <legend className="text-lg font-bold text-ink">Información del perfil</legend>
            <p className="text-xs text-muted">Los campos con * son obligatorios.</p>
            <div className="grid gap-5 sm:grid-cols-2">
              {textField('fullName', 'Nombre completo', true)}
              {textField('email', 'Correo de contacto', true, 'email', 254)}
              {textField('graduationYear', 'Año de titulación', true, 'number')}
              {textField('headline', 'Profesión o puesto actual', true)}
              {textField('city', 'Ciudad')}
            </div>
            <label
              htmlFor="graduate-bio"
              className="flex flex-col gap-2 text-sm font-medium text-ink"
            >
              Sobre mí *
              <textarea
                id="graduate-bio"
                className={inputClass}
                rows={4}
                required
                minLength={20}
                maxLength={4000}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </label>
            <label
              htmlFor="graduate-experience"
              className="flex flex-col gap-2 text-sm font-medium text-ink"
            >
              Experiencia profesional
              <textarea
                id="graduate-experience"
                className={inputClass}
                rows={5}
                maxLength={6000}
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
              />
            </label>
            <div>
              <h2 className="mb-4 text-lg font-bold text-ink">Redes y enlaces</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {textField('website', 'Sitio web', false, 'url', 500)}
                {textField('linkedin', 'LinkedIn', false, 'url', 500)}
                {textField('github', 'GitHub', false, 'url', 500)}
                {textField('facebook', 'Facebook', false, 'url', 500)}
                {textField('instagram', 'Instagram', false, 'url', 500)}
              </div>
            </div>
            <div className="space-y-5 rounded-lg border border-line bg-elevated p-5">
              <h2 className="text-lg font-bold text-ink">Archivos</h2>
              {(
                [
                  [
                    'diploma',
                    'Título profesional *',
                    '.pdf,.jpg,.jpeg,.png,.webp',
                    'PDF, JPG, PNG o WEBP, hasta 15 MB. Solo los revisores del departamento tendrán acceso.',
                  ],
                  [
                    'photo',
                    'Fotografía',
                    '.jpg,.jpeg,.png,.webp',
                    'JPG, PNG o WEBP, hasta 5 MB. Se mostrará en tu perfil aprobado.',
                  ],
                  [
                    'curriculum',
                    'Currículum',
                    '.pdf',
                    'PDF, hasta 15 MB. Será público cuando tu perfil sea aprobado; evita incluir datos que no quieras compartir.',
                  ],
                ] as const
              ).map(([key, label, accept, hint]) => (
                <div key={key}>
                  <label htmlFor={`graduate-${key}`} className="block text-sm font-medium text-ink">
                    {label}
                  </label>
                  <p id={`graduate-${key}-hint`} className="mt-1 text-xs text-muted">
                    {hint}
                  </p>
                  <input
                    id={`graduate-${key}`}
                    aria-describedby={`graduate-${key}-hint`}
                    type="file"
                    accept={accept}
                    required={key === 'diploma'}
                    className={`${inputClass} mt-2`}
                    onChange={(e) => setFiles({ ...files, [key]: e.target.files?.[0] })}
                  />
                </div>
              ))}
            </div>
            <label className="flex items-start gap-3 text-sm text-muted">
              <input
                type="checkbox"
                checked={form.showEmail}
                onChange={(e) => setForm({ ...form, showEmail: e.target.checked })}
                className="mt-1"
              />
              Mostrar mi correo de contacto en mi perfil público.
            </label>
            <label className="flex items-start gap-3 text-sm text-muted">
              <input
                type="checkbox"
                required
                checked={form.consent}
                onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                className="mt-1"
              />
              Confirmo que soy egresado titulado de ISC y autorizo al departamento a revisar mi
              título y publicar la información de mi perfil, fotografía, redes y currículum después
              de aprobar mi solicitud. *
            </label>
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
            <button type="submit" className="btn-primary disabled:cursor-wait disabled:opacity-50">
              {busy ? 'Enviando solicitud…' : 'Enviar para verificación'}
            </button>
          </fieldset>
        </form>
      )}
    </div>
  );
}
