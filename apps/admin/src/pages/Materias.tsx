import { useEffect, useState } from 'react';
import { ZodError } from 'zod';
import { subjectSchema, type Program, type Subject, type Specialty } from '@dsc-isc/shared';
import ImageUploader, { type MediaValue } from '../components/ImageUploader';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { apiDelete, apiGet, apiPost, apiPut, ApiError } from '../lib/apiClient';

const emptyForm = {
  code: '',
  name: '',
  semester: 1,
  credits: '',
  theoryHours: '',
  practicalHours: '',
  academicSourceUrl: '',
  prerequisitesVerified: false,
  syllabus: null as MediaValue | null,
  objective: '',
  programId: '',
  specialtyId: '',
  isElective: false,
  prerequisiteIds: [] as string[],
};

export default function Materias() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [curriculum, setCurriculum] = useState('all');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  const load = async () => {
    setLoading(true);
    const [subjectList, programList, specialtyList] = await Promise.all([
      apiGet<Subject[]>('/subjects'),
      apiGet<Program[]>('/programs'),
      apiGet<Specialty[]>('/specialties'),
    ]);
    setSubjects(subjectList);
    setPrograms(programList);
    setSpecialties(specialtyList);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      programId: programs[0]?.id ?? '',
      specialtyId: !['all', 'general'].includes(curriculum) ? curriculum : '',
    });
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setForm({
      code: subject.code,
      name: subject.name,
      semester: subject.semester,
      credits: subject.credits != null ? String(subject.credits) : '',
      theoryHours: subject.theoryHours != null ? String(subject.theoryHours) : '',
      practicalHours: subject.practicalHours != null ? String(subject.practicalHours) : '',
      academicSourceUrl: subject.academicSourceUrl ?? '',
      prerequisitesVerified: subject.prerequisitesVerified ?? false,
      syllabus: subject.syllabus ? { id: subject.syllabus.id, url: subject.syllabus.url } : null,
      objective: subject.objective,
      programId: subject.programId,
      specialtyId: subject.specialtyId ?? '',
      isElective: subject.isElective ?? false,
      prerequisiteIds: subject.prerequisiteIds,
    });
    setError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setError(null);
    const payload = {
      ...form,
      specialtyId: form.specialtyId || null,
      theoryHours: form.theoryHours.trim() ? Number(form.theoryHours) : null,
      practicalHours: form.practicalHours.trim() ? Number(form.practicalHours) : null,
      academicSourceUrl: form.academicSourceUrl.trim() || null,
      syllabusMediaId: form.syllabus?.id ?? null,
      semester: Number(form.semester),
      credits: form.credits.trim() ? Number(form.credits) : null,
    };
    try {
      subjectSchema.parse(payload);
    } catch (err) {
      setError(
        err instanceof ZodError ? (err.issues[0]?.message ?? 'Datos inválidos') : 'Datos inválidos',
      );
      return;
    }
    try {
      if (editingId) await apiPut(`/subjects/${editingId}`, payload);
      else await apiPost('/subjects', payload);
      setDialogOpen(false);
      await load();
    } catch (err) {
      // Aquí es donde la API rechaza un ciclo de prerrequisitos (409).
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar');
    }
  };

  const programName = (id: string) => programs.find((p) => p.id === id)?.name ?? '—';
  const subjectLabel = (id: string) => {
    const s = subjects.find((x) => x.id === id);
    return s ? `${s.code} · ${s.name}` : id;
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      curriculum === 'all' ||
      (curriculum === 'general' ? !s.specialtyId : s.specialtyId === curriculum),
  );
  const bySemester = [...filteredSubjects]
    .sort((a, b) => a.semester - b.semester || a.code.localeCompare(b.code))
    .reduce<Record<number, Subject[]>>((acc, s) => {
      (acc[s.semester] ??= []).push(s);
      return acc;
    }, {});

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Materias y retícula</h1>
          <p className="mt-1 text-sm text-muted">
            Los prerrequisitos se validan en el servidor: no se puede guardar una relación que cree
            un ciclo (una materia que dependa, directa o indirectamente, de sí misma).
          </p>
        </div>
        <Button onClick={openCreate}>Nueva materia</Button>
      </div>

      <div className="mt-6">
        <Label htmlFor="curriculum">Filtrar retícula</Label>
        <select
          id="curriculum"
          className="mb-4 ml-3 rounded border border-line bg-surface p-2 text-sm"
          value={curriculum}
          onChange={(e) => setCurriculum(e.target.value)}
        >
          <option value="all">Todas las materias</option>
          <option value="general">Carrera (sin especialidad)</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <DataTable
          data={filteredSubjects}
          getRowId={(s) => s.id}
          emptyMessage={loading ? 'Cargando…' : 'Aún no hay materias.'}
          columns={[
            { header: 'Código', cell: (s) => <span className="font-mono text-xs">{s.code}</span> },
            {
              header: 'Nombre',
              cell: (s) => <span className="font-medium text-ink">{s.name}</span>,
            },
            { header: 'Semestre', cell: (s) => s.semester },
            { header: 'Programa', cell: (s) => programName(s.programId) },
            {
              header: 'Especialidad',
              cell: (s) => specialties.find((x) => x.id === s.specialtyId)?.name ?? 'Carrera',
            },
            { header: 'Prerrequisitos', cell: (s) => s.prerequisiteIds.length },
          ]}
          actions={(s) => (
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => openEdit(s)}>
                Editar
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(s)}>
                Eliminar
              </Button>
            </div>
          )}
        />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-bold text-ink">Vista de la retícula</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(bySemester)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([semester, items]) => (
              <div key={semester} className="rounded-lg border border-line bg-surface p-4">
                <p className="font-mono text-xs uppercase tracking-widest text-muted">
                  Semestre {semester}
                </p>
                <div className="mt-3 flex flex-col gap-3">
                  {items.map((s) => (
                    <div key={s.id} className="rounded-md border border-line p-3">
                      <p className="text-sm font-semibold text-ink">
                        {s.code} · {s.name}
                      </p>
                      {s.prerequisiteIds.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {s.prerequisiteIds.map((id) => (
                            <span
                              key={id}
                              className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted"
                            >
                              {subjectLabel(id)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar materia' : 'Nueva materia'}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="semester">Semestre</Label>
                <Input
                  id="semester"
                  type="number"
                  min={1}
                  max={20}
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="credits">Créditos (opcional)</Label>
              <Input
                id="credits"
                type="number"
                min={0}
                max={60}
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(['theoryHours', 'practicalHours'] as const).map((field) => (
                <div key={field} className="flex flex-col gap-1.5">
                  <Label htmlFor={field}>
                    {field === 'theoryHours' ? 'Horas teóricas' : 'Horas prácticas'}
                  </Label>
                  <Input
                    id={field}
                    type="number"
                    min={0}
                    max={40}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted">
              Horas semanales según la retícula. Deja vacío lo que aún no esté confirmado.
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="academicSourceUrl">Enlace al plan de estudios de esta materia</Label>
              <Input
                id="academicSourceUrl"
                type="url"
                placeholder="https://..."
                value={form.academicSourceUrl}
                onChange={(e) => setForm({ ...form, academicSourceUrl: e.target.value })}
              />
            </div>
            <ImageUploader
              kind="DOCUMENT"
              label="Plan de estudios de la materia (PDF)"
              value={form.syllabus}
              onChange={(syllabus) => setForm({ ...form, syllabus })}
            />
            <p className="text-xs text-muted">
              Consultar fuente académica abrirá el PDF seleccionado; si no hay uno, abrirá el enlace
              al plan de esta materia.
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="specialtyId">Retícula de especialidad</Label>
              <select
                id="specialtyId"
                className="rounded-md border border-line bg-surface px-3 py-2 text-sm"
                value={form.specialtyId}
                onChange={(e) => setForm({ ...form, specialtyId: e.target.value })}
              >
                <option value="">Carrera (sin especialidad)</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-3 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.isElective}
                onChange={(e) => setForm({ ...form, isElective: e.target.checked })}
              />
              Materia optativa
            </label>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="objective">Objetivo</Label>
              <textarea
                id="objective"
                rows={2}
                className="rounded-md border border-line bg-surface px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
                value={form.objective}
                onChange={(e) => setForm({ ...form, objective: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Programa</Label>
              <Select
                value={form.programId}
                onValueChange={(programId) => setForm({ ...form, programId })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un programa" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-ink">Prerrequisitos</p>
              <MultiSelect
                options={subjects
                  .filter((s) => s.id !== editingId)
                  .map((s) => ({ value: s.id, label: `${s.code} · ${s.name}` }))}
                selected={form.prerequisiteIds}
                onChange={(prerequisiteIds) => setForm({ ...form, prerequisiteIds })}
              />
            </div>

            <label className="flex items-start gap-3 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.prerequisitesVerified}
                onChange={(e) => setForm({ ...form, prerequisitesVerified: e.target.checked })}
              />
              Prerrequisitos revisados y confirmados por la coordinación académica
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
        title="Eliminar materia"
        description={`¿Eliminar "${deleteTarget?.name}"? Si otra materia la usa como prerrequisito, la eliminación se bloqueará.`}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await apiDelete(`/subjects/${deleteTarget.id}`);
            await load();
          } catch (err) {
            setError(err instanceof ApiError ? err.message : 'No se pudo eliminar');
          }
        }}
      />
    </div>
  );
}
