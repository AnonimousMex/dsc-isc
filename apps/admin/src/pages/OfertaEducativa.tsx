import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ZodError } from 'zod';
import { programSchema, type Program } from '@dsc-isc/shared';
import ImageUploader, { type MediaValue } from '../components/ImageUploader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { apiGet, apiPost, apiPut, ApiError } from '../lib/apiClient';

const emptyForm = {
  slug: '',
  name: '',
  mission: '',
  vision: '',
  goals: '',
  admissionProfile: '',
  graduateProfile: [] as string[],
  actionField: '',
  videoUrl: '',
  reticulaPdf: null as MediaValue | null,
};

export default function OfertaEducativa() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('__new__');
  const [form, setForm] = useState(emptyForm);
  const [newAttribute, setNewAttribute] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    const list = await apiGet<Program[]>('/programs');
    setPrograms(list);
    if (list.length > 0 && selectedSlug === '__new__') {
      selectProgram(list[0].slug, list);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectProgram = (slug: string, list = programs) => {
    setSelectedSlug(slug);
    setError(null);
    setSaved(false);
    if (slug === '__new__') {
      setForm(emptyForm);
      return;
    }
    const program = list.find((p) => p.slug === slug);
    if (!program) return;
    setForm({
      slug: program.slug,
      name: program.name,
      mission: program.mission,
      vision: program.vision,
      goals: program.goals,
      admissionProfile: program.admissionProfile,
      graduateProfile: program.graduateProfile,
      actionField: program.actionField,
      videoUrl: program.videoUrl ?? '',
      reticulaPdf: program.reticulaPdf ? { id: program.reticulaPdf.id, url: program.reticulaPdf.url } : null,
    });
  };

  const handleSubmit = async () => {
    setError(null);
    setSaved(false);
    const payload = {
      slug: form.slug,
      name: form.name,
      mission: form.mission,
      vision: form.vision,
      goals: form.goals,
      admissionProfile: form.admissionProfile,
      graduateProfile: form.graduateProfile,
      actionField: form.actionField,
      videoUrl: form.videoUrl || null,
      reticulaPdfId: form.reticulaPdf?.id ?? null,
    };
    try {
      programSchema.parse(payload);
    } catch (err) {
      setError(err instanceof ZodError ? (err.issues[0]?.message ?? 'Datos inválidos') : 'Datos inválidos');
      return;
    }
    try {
      if (selectedSlug === '__new__') {
        await apiPost('/programs', payload);
      } else {
        await apiPut(`/programs/${selectedSlug}`, payload);
      }
      setSaved(true);
      await load();
      setSelectedSlug(payload.slug);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Oferta educativa</h1>
      </div>

      <div className="mt-4 flex items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Programa</Label>
          <Select value={selectedSlug} onValueChange={(slug) => selectProgram(slug)}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {programs.map((p) => (
                <SelectItem key={p.slug} value={p.slug}>
                  {p.name}
                </SelectItem>
              ))}
              <SelectItem value="__new__">+ Nuevo programa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 flex max-w-2xl flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input id="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="mission">Misión</Label>
          <textarea
            id="mission"
            rows={2}
            className="rounded-md border border-line bg-surface px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
            value={form.mission}
            onChange={(e) => setForm({ ...form, mission: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vision">Visión</Label>
          <textarea
            id="vision"
            rows={2}
            className="rounded-md border border-line bg-surface px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
            value={form.vision}
            onChange={(e) => setForm({ ...form, vision: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="goals">Metas y objetivos</Label>
          <textarea
            id="goals"
            rows={2}
            className="rounded-md border border-line bg-surface px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
            value={form.goals}
            onChange={(e) => setForm({ ...form, goals: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="admissionProfile">Perfil de ingreso</Label>
          <textarea
            id="admissionProfile"
            rows={2}
            className="rounded-md border border-line bg-surface px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
            value={form.admissionProfile}
            onChange={(e) => setForm({ ...form, admissionProfile: e.target.value })}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Atributos de egreso (se numeran en el sitio)</p>
          <div className="flex flex-col gap-2">
            {form.graduateProfile.map((attr, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={attr}
                  onChange={(e) => {
                    const graduateProfile = [...form.graduateProfile];
                    graduateProfile[i] = e.target.value;
                    setForm({ ...form, graduateProfile });
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setForm({ ...form, graduateProfile: form.graduateProfile.filter((_, j) => j !== i) })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="Nuevo atributo de egreso"
                value={newAttribute}
                onChange={(e) => setNewAttribute(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!newAttribute) return;
                  setForm({ ...form, graduateProfile: [...form.graduateProfile, newAttribute] });
                  setNewAttribute('');
                }}
              >
                <Plus className="h-3 w-3" /> Agregar
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="actionField">Campo de acción</Label>
          <textarea
            id="actionField"
            rows={2}
            className="rounded-md border border-line bg-surface px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
            value={form.actionField}
            onChange={(e) => setForm({ ...form, actionField: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="videoUrl">Video institucional (URL de embed)</Label>
          <Input
            id="videoUrl"
            value={form.videoUrl}
            onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            placeholder="Déjalo vacío para mostrar “Video institucional próximamente”"
          />
        </div>

        <ImageUploader
          value={form.reticulaPdf}
          onChange={(reticulaPdf) => setForm({ ...form, reticulaPdf })}
          kind="DOCUMENT"
          label="Retícula en PDF (descargable)"
        />

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={handleSubmit}>Guardar</Button>
          {saved && <span className="text-sm text-green-700">Guardado.</span>}
        </div>
      </div>
    </div>
  );
}
