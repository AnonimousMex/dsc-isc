import { useEffect, useState } from 'react';
import { ZodError } from 'zod';
import { specialtySchema, type Specialty } from '@dsc-isc/shared';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import ImageUploader, { type MediaValue } from '../components/ImageUploader';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { apiDelete, apiGet, apiPost, apiPut, ApiError } from '../lib/apiClient';

const emptyForm = { slug: '', name: '', description: '', image: null as MediaValue | null };

export default function Especialidades() {
  const [items, setItems] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Specialty | null>(null);

  const load = async () => {
    setLoading(true);
    setItems(await apiGet<Specialty[]>('/specialties'));
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

  const openEdit = (item: Specialty) => {
    setEditingId(item.id);
    setForm({
      slug: item.slug,
      name: item.name,
      description: item.description,
      image: item.image ? { id: item.image.id, url: item.image.url } : null,
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
      imageId: form.image?.id ?? null,
    };
    try {
      specialtySchema.parse(payload);
    } catch (err) {
      setError(err instanceof ZodError ? (err.issues[0]?.message ?? 'Datos inválidos') : 'Datos inválidos');
      return;
    }
    try {
      if (editingId) await apiPut(`/specialties/${editingId}`, payload);
      else await apiPost('/specialties', payload);
      setDialogOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Especialidades</h1>
        <Button onClick={openCreate}>Nueva especialidad</Button>
      </div>

      <div className="mt-6">
        <DataTable
          data={items}
          getRowId={(s) => s.id}
          emptyMessage={loading ? 'Cargando…' : 'Aún no hay especialidades.'}
          columns={[
            { header: 'Nombre', cell: (s) => <span className="font-medium text-ink">{s.name}</span> },
            { header: 'Slug', cell: (s) => <span className="font-mono text-xs">{s.slug}</span> },
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar especialidad' : 'Nueva especialidad'}</DialogTitle>
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
            <ImageUploader value={form.image} onChange={(image) => setForm({ ...form, image })} label="Imagen" />
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
        title="Eliminar especialidad"
        description={`¿Eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await apiDelete(`/specialties/${deleteTarget.id}`);
          await load();
        }}
      />
    </div>
  );
}
