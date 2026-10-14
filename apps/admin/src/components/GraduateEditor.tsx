import { useEffect, useState } from 'react';
import { graduateEditSchema, type GraduateApplication } from '@dsc-isc/shared';
import { request } from '../lib/apiClient';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

const textFields = { fullName: 'Nombre completo', email: 'Correo electrónico', headline: 'Profesión / cargo', city: 'Ciudad', website: 'Sitio web', linkedin: 'LinkedIn', github: 'GitHub', facebook: 'Facebook', instagram: 'Instagram' } as const;

export default function GraduateEditor({ graduate, onClose, onSaved }: {
  graduate: GraduateApplication; onClose: () => void; onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState(() => ({
    fullName: graduate.fullName, email: graduate.email, graduationYear: graduate.graduationYear,
    headline: graduate.headline, bio: graduate.bio, experience: graduate.experience, city: graduate.city,
    website: graduate.website ?? '', linkedin: graduate.linkedin ?? '', github: graduate.github ?? '',
    facebook: graduate.facebook ?? '', instagram: graduate.instagram ?? '', showEmail: graduate.showEmail,
    removePhoto: false, removeCurriculum: false,
  }));
  const [photo, setPhoto] = useState<File | null>(null);
  const [curriculum, setCurriculum] = useState<File | null>(null);
  const [preview, setPreview] = useState(graduate.photoUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!photo) { setPreview(graduate.photoUrl); return; }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo, graduate.photoUrl]);

  async function save() {
    if (busy) return;
    setError(null);
    const parsed = graduateEditSchema.safeParse(form);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Revisa los datos'); return; }
    if (photo && photo.size > 5 * 1024 * 1024) { setError('La foto excede 5 MB'); return; }
    if (curriculum && curriculum.size > 15 * 1024 * 1024) { setError('El currículum excede 15 MB'); return; }
    const body = new FormData();
    body.append('profile', JSON.stringify(parsed.data));
    if (photo && !form.removePhoto) body.append('photo', photo);
    if (curriculum && !form.removeCurriculum) body.append('curriculum', curriculum);
    setBusy(true);
    try {
      await request(`/graduates/admin/${graduate.id}`, { method: 'PUT', body });
      await onSaved();
      onClose();
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudieron guardar los cambios'); }
    finally { setBusy(false); }
  }

  return <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
    <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
      <DialogHeader><DialogTitle>Editar egresado</DialogTitle></DialogHeader>
      <form onSubmit={(event) => { event.preventDefault(); void save(); }}>
        <fieldset disabled={busy} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {(Object.keys(textFields) as (keyof typeof textFields)[]).map((key) => <label key={key} className="block text-sm font-medium text-ink">{textFields[key]}
              <Input type={key === 'email' ? 'email' : ['website', 'linkedin', 'github', 'facebook', 'instagram'].includes(key) ? 'url' : 'text'} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1" />
            </label>)}
            <label className="block text-sm font-medium text-ink">Año de titulación
              <Input type="number" min={1950} max={new Date().getFullYear()} required value={form.graduationYear} onChange={(e) => setForm({ ...form, graduationYear: Number(e.target.value) })} className="mt-1" />
            </label>
          </div>
          {(['bio', 'experience'] as const).map((key) => <label key={key} className="block text-sm font-medium text-ink">{key === 'bio' ? 'Sobre mí' : 'Experiencia'}
            <textarea rows={4} value={form[key]} maxLength={key === 'bio' ? 4000 : 6000} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1 w-full rounded-md border border-line bg-surface p-3 text-sm" />
          </label>)}
          <div className="space-y-3 rounded-md border border-line p-4">
            {preview && !form.removePhoto && <img src={preview} alt="Vista previa de la foto" className="h-32 w-32 rounded-md object-cover" />}
            <label className="block text-sm font-medium text-ink">Foto (JPG, PNG o WEBP, hasta 5 MB)
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { setPhoto(e.target.files?.[0] ?? null); setForm({ ...form, removePhoto: false }); }} className="mt-2 block w-full text-sm" />
            </label>
            {(graduate.photoUrl || photo) && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.removePhoto} onChange={(e) => setForm({ ...form, removePhoto: e.target.checked })} />Quitar foto</label>}
          </div>
          <div className="space-y-3 rounded-md border border-line p-4">
            {graduate.curriculumUrl && <a href={graduate.curriculumUrl} className="text-sm text-accent underline">Descargar currículum actual</a>}
            <label className="block text-sm font-medium text-ink">Currículum (PDF, hasta 15 MB)
              <input type="file" accept="application/pdf" onChange={(e) => { setCurriculum(e.target.files?.[0] ?? null); setForm({ ...form, removeCurriculum: false }); }} className="mt-2 block w-full text-sm" />
            </label>
            {(graduate.curriculumUrl || curriculum) && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.removeCurriculum} onChange={(e) => setForm({ ...form, removeCurriculum: e.target.checked })} />Quitar currículum</label>}
          </div>
          <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={form.showEmail} onChange={(e) => setForm({ ...form, showEmail: e.target.checked })} />Mostrar correo en el perfil público</label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit">{busy ? 'Guardando…' : 'Guardar cambios'}</Button></div>
        </fieldset>
      </form>
    </DialogContent>
  </Dialog>;
}
