import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ZodError } from 'zod';
import { labSchema, type Lab } from '@dsc-isc/shared';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import ImageUploader, { type MediaValue } from '../components/ImageUploader';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { apiDelete, apiGet, apiPost, apiPut, ApiError } from '../lib/apiClient';

const emptyForm = {
  slug: '',
  name: '',
  description: '',
  equipment: [] as { label: string; value: string }[],
  relatedSubjects: [] as string[],
  gallery: [] as MediaValue[],
};

export default function Laboratorios() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lab | null>(null);
  const [newSubject, setNewSubject] = useState('');

  const load = async () => {
    setLoading(true);
    setLabs(await apiGet<Lab[]>('/labs'));
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

  const openEdit = (lab: Lab) => {
    setEditingId(lab.id);
    setForm({
      slug: lab.slug,
      name: lab.name,
      description: lab.description,
      equipment: lab.equipment,
      relatedSubjects: lab.relatedSubjects,
      gallery: lab.gallery.map((m) => ({ id: m.id, url: m.url })),
    });
    setError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setError(null);
    const payload = {
      slug: form.slug,
      name: form.name,
      description: form.description,
      equipment: form.equipment,
      relatedSubjects: form.relatedSubjects,
      galleryMediaIds: form.gallery.map((m) => m.id),
    };
    try {
      labSchema.parse(payload);
    } catch (err) {
      setError(err instanceof ZodError ? (err.issues[0]?.message ?? 'Datos inválidos') : 'Datos inválidos');
      return;
    }
    try {
      if (editingId) await apiPut(`/labs/${editingId}`, payload);
      else await apiPost('/labs', payload);
      setDialogOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Laboratorios</h1>
        <Button onClick={openCreate}>Nuevo laboratorio</Button>
      </div>

      <div className="mt-6">
        <DataTable
          data={labs}
          getRowId={(l) => l.id}
          emptyMessage={loading ? 'Cargando…' : 'Aún no hay laboratorios.'}
          columns={[
            { header: 'Nombre', cell: (l) => <span className="font-medium text-ink">{l.name}</span> },
            { header: 'Slug', cell: (l) => <span className="font-mono text-xs">{l.slug}</span> },
            { header: 'Equipo', cell: (l) => `${l.equipment.length} items` },
            { header: 'Galería', cell: (l) => `${l.gallery.length} fotos` },
          ]}
          actions={(l) => (
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => openEdit(l)}>
                Editar
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(l)}>
                Eliminar
              </Button>
            </div>
          )}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar laboratorio' : 'Nuevo laboratorio'}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
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
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                rows={3}
                className="rounded-md border border-line bg-surface px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-ink">Equipo</p>
              <div className="flex flex-col gap-2">
                {form.equipment.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="24x"
                      value={item.label}
                      onChange={(e) => {
                        const equipment = [...form.equipment];
                        equipment[i] = { ...item, label: e.target.value };
                        setForm({ ...form, equipment });
                      }}
                      className="w-20"
                    />
                    <Input
                      placeholder="Descripción del equipo"
                      value={item.value}
                      onChange={(e) => {
                        const equipment = [...form.equipment];
                        equipment[i] = { ...item, value: e.target.value };
                        setForm({ ...form, equipment });
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setForm({ ...form, equipment: form.equipment.filter((_, j) => j !== i) })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForm({ ...form, equipment: [...form.equipment, { label: '', value: '' }] })}
                >
                  <Plus className="h-3 w-3" /> Agregar equipo
                </Button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-ink">Materias que se imparten aquí</p>
              <div className="flex flex-wrap gap-2">
                {form.relatedSubjects.map((name, i) => (
                  <span key={name} className="flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs">
                    {name}
                    <button
                      type="button"
                      onClick={() =>
                        setForm({ ...form, relatedSubjects: form.relatedSubjects.filter((_, j) => j !== i) })
                      }
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Input
                  placeholder="Nombre de la materia"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!newSubject) return;
                    setForm({ ...form, relatedSubjects: [...form.relatedSubjects, newSubject] });
                    setNewSubject('');
                  }}
                >
                  Agregar
                </Button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-ink">Galería</p>
              <div className="flex flex-col gap-3">
                {form.gallery.map((media, i) => (
                  <div key={media.id} className="flex items-center gap-3">
                    <img src={media.url} alt="" className="h-12 w-12 rounded object-cover" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setForm({ ...form, gallery: form.gallery.filter((_, j) => j !== i) })}
                    >
                      Quitar
                    </Button>
                  </div>
                ))}
                <ImageUploader
                  value={null}
                  onChange={(media) => media && setForm({ ...form, gallery: [...form.gallery, media] })}
                  label="Agregar foto a la galería"
                />
              </div>
            </div>

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
        title="Eliminar laboratorio"
        description={`¿Eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await apiDelete(`/labs/${deleteTarget.id}`);
          await load();
        }}
      />
    </div>
  );
}
