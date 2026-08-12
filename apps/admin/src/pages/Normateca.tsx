import { useEffect, useState } from 'react';
import { ZodError } from 'zod';
import { documentSchema, type DscDocument } from '@dsc-isc/shared';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import ImageUploader, { type MediaValue } from '../components/ImageUploader';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { apiDelete, apiGet, apiPost, apiPut, ApiError } from '../lib/apiClient';

const CATEGORIES = ['Reglamento', 'Formato', 'Normativa'] as const;

const emptyForm = { title: '', category: 'Reglamento' as (typeof CATEGORIES)[number], media: null as MediaValue | null };

export default function Normateca() {
  const [documents, setDocuments] = useState<DscDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DscDocument | null>(null);

  const load = async () => {
    setLoading(true);
    setDocuments(await apiGet<DscDocument[]>('/documents'));
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

  const openEdit = (doc: DscDocument) => {
    setEditingId(doc.id);
    setForm({
      title: doc.title,
      category: doc.category as (typeof CATEGORIES)[number],
      media: { id: doc.media.id, url: doc.media.url },
    });
    setError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setError(null);
    const payload = { title: form.title, category: form.category, mediaId: form.media?.id ?? '' };
    try {
      documentSchema.parse(payload);
    } catch (err) {
      setError(err instanceof ZodError ? (err.issues[0]?.message ?? 'Datos inválidos') : 'Datos inválidos');
      return;
    }
    try {
      if (editingId) await apiPut(`/documents/${editingId}`, payload);
      else await apiPost('/documents', payload);
      setDialogOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Normateca</h1>
        <Button onClick={openCreate}>Nuevo documento</Button>
      </div>

      <div className="mt-6">
        <DataTable
          data={documents}
          getRowId={(d) => d.id}
          emptyMessage={loading ? 'Cargando…' : 'Aún no hay documentos.'}
          columns={[
            { header: 'Título', cell: (d) => <span className="font-medium text-ink">{d.title}</span> },
            { header: 'Categoría', cell: (d) => d.category },
            { header: 'Actualizado', cell: (d) => new Date(d.updatedAt).toLocaleDateString('es-MX') },
          ]}
          actions={(d) => (
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => openEdit(d)}>
                Editar
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(d)}>
                Eliminar
              </Button>
            </div>
          )}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar documento' : 'Nuevo documento'}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Título</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Categoría</Label>
              <Select
                value={form.category}
                onValueChange={(category) => setForm({ ...form, category: category as (typeof CATEGORIES)[number] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ImageUploader
              value={form.media}
              onChange={(media) => setForm({ ...form, media })}
              kind="DOCUMENT"
              label="Documento (PDF) o enlace"
            />

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
        title="Eliminar documento"
        description={`¿Eliminar "${deleteTarget?.title}"? Esta acción no se puede deshacer.`}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await apiDelete(`/documents/${deleteTarget.id}`);
          await load();
        }}
      />
    </div>
  );
}
