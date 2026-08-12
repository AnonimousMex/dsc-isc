import { useEffect, useState } from 'react';
import { ZodError } from 'zod';
import { teacherSchema, type Subject, type Teacher, type TeacherSummary } from '@dsc-isc/shared';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import ImageUploader, { type MediaValue } from '../components/ImageUploader';
import MultiSelect from '../components/MultiSelect';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { apiDelete, apiGet, apiPost, apiPut, ApiError } from '../lib/apiClient';

const emptyForm = {
  fullName: '',
  title: '',
  bio: '',
  experience: '',
  photo: null as MediaValue | null,
  youtubeUrl: '',
  email: '',
  website: '',
  linkedin: '',
  facebook: '',
  twitter: '',
  isActive: true,
  subjectIds: [] as string[],
};

export default function Docentes() {
  const [teachers, setTeachers] = useState<TeacherSummary[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeacherSummary | null>(null);

  const load = async () => {
    setLoading(true);
    const [teacherList, subjectList] = await Promise.all([
      apiGet<TeacherSummary[]>('/teachers'),
      apiGet<Subject[]>('/subjects'),
    ]);
    setTeachers(teacherList);
    setSubjects(subjectList);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setDialogOpen(true);
  };

  // El listado solo trae TeacherSummary (sin bio/redes/materias) — para
  // editar se pide el detalle completo por slug antes de abrir el diálogo.
  const openEdit = async (summary: TeacherSummary) => {
    const teacher: Teacher = await apiGet(`/teachers/${summary.slug}`);
    setEditingId(teacher.id);
    setForm({
      fullName: teacher.fullName,
      title: teacher.title,
      bio: teacher.bio,
      experience: teacher.experience,
      photo: teacher.photo ? { id: teacher.photo.id, url: teacher.photo.url } : null,
      youtubeUrl: teacher.youtubeUrl ?? '',
      email: teacher.email ?? '',
      website: teacher.website ?? '',
      linkedin: teacher.linkedin ?? '',
      facebook: teacher.facebook ?? '',
      twitter: teacher.twitter ?? '',
      isActive: teacher.isActive,
      subjectIds: teacher.subjectIds,
    });
    setError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setError(null);
    const payload = {
      fullName: form.fullName,
      title: form.title,
      bio: form.bio,
      experience: form.experience,
      photoId: form.photo?.id ?? null,
      youtubeUrl: form.youtubeUrl || null,
      email: form.email || null,
      website: form.website || null,
      linkedin: form.linkedin || null,
      facebook: form.facebook || null,
      twitter: form.twitter || null,
      isActive: form.isActive,
      subjectIds: form.subjectIds,
    };
    try {
      teacherSchema.parse(payload);
    } catch (err) {
      setError(err instanceof ZodError ? (err.issues[0]?.message ?? 'Datos inválidos') : 'Datos inválidos');
      return;
    }
    try {
      if (editingId) {
        await apiPut(`/teachers/${editingId}`, payload);
      } else {
        await apiPost('/teachers', payload);
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Docentes</h1>
          <p className="mt-1 text-sm text-muted">
            Sin foto, el sitio muestra un avatar con iniciales — no hace falta subir una foto de
            inmediato.
          </p>
        </div>
        <Button onClick={openCreate}>Nuevo docente</Button>
      </div>

      <div className="mt-6">
        <DataTable
          data={teachers}
          getRowId={(t) => t.id}
          emptyMessage={loading ? 'Cargando…' : 'Aún no hay docentes.'}
          columns={[
            { header: 'Nombre', cell: (t) => <span className="font-medium text-ink">{t.fullName}</span> },
            { header: 'Título', cell: (t) => t.title },
            {
              header: 'Estado',
              cell: (t) => (
                <span className={t.isActive ? 'text-green-700' : 'text-muted'}>
                  {t.isActive ? 'Activo' : 'Inactivo'}
                </span>
              ),
            },
            { header: 'Foto', cell: (t) => (t.photo ? 'Sí' : 'Iniciales') },
          ]}
          actions={(t) => (
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => openEdit(t)}>
                Editar
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(t)}>
                Eliminar
              </Button>
            </div>
          )}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar docente' : 'Nuevo docente'}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Título</Label>
                <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bio">Biografía</Label>
              <textarea
                id="bio"
                rows={3}
                className="rounded-md border border-line bg-surface px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="experience">Experiencia</Label>
              <textarea
                id="experience"
                rows={3}
                className="rounded-md border border-line bg-surface px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
              />
            </div>

            <ImageUploader value={form.photo} onChange={(photo) => setForm({ ...form, photo })} label="Foto" />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="youtubeUrl">Video (YouTube, embed)</Label>
                <Input
                  id="youtubeUrl"
                  value={form.youtubeUrl}
                  onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Correo</Label>
                <Input id="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="website">Sitio web</Label>
                <Input
                  id="website"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={form.linkedin}
                  onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={form.facebook}
                  onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="twitter">X (Twitter)</Label>
                <Input
                  id="twitter"
                  value={form.twitter}
                  onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-ink">Materias que imparte</p>
              <MultiSelect
                options={subjects.map((s) => ({ value: s.id, label: `${s.code} · ${s.name}` }))}
                selected={form.subjectIds}
                onChange={(subjectIds) => setForm({ ...form, subjectIds })}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Activo (visible en el sitio)
            </label>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar docente"
        description={`¿Eliminar a ${deleteTarget?.fullName}? Esta acción no se puede deshacer.`}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await apiDelete(`/teachers/${deleteTarget.id}`);
          await load();
        }}
      />
    </div>
  );
}
