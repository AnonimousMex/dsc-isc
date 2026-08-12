import { useEffect, useState } from 'react';
import { ZodError } from 'zod';
import { communitySectionSchema, type CommunitySection, type DscDocument } from '@dsc-isc/shared';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import MultiSelect from '../components/MultiSelect';
import RichTextEditor from '../components/RichTextEditor';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { apiDelete, apiGet, apiPost, apiPut, ApiError } from '../lib/apiClient';

const emptyForm = { slug: '', title: '', body: '', documentIds: [] as string[] };

export default function Comunidad() {
  const [sections, setSections] = useState<CommunitySection[]>([]);
  const [documents, setDocuments] = useState<DscDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CommunitySection | null>(null);

  const load = async () => {
    setLoading(true);
    const [sectionList, documentList] = await Promise.all([
      apiGet<CommunitySection[]>('/community-sections'),
      apiGet<DscDocument[]>('/documents'),
    ]);
    setSections(sectionList);
    setDocuments(documentList);
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

  const openEdit = (section: CommunitySection) => {
    setEditingId(section.id);
    setForm({ slug: section.slug, title: section.title, body: section.body, documentIds: section.documentIds });
    setError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      communitySectionSchema.parse(form);
    } catch (err) {
      setError(err instanceof ZodError ? (err.issues[0]?.message ?? 'Datos inválidos') : 'Datos inválidos');
      return;
    }
    try {
      if (editingId) await apiPut(`/community-sections/${editingId}`, form);
      else await apiPost('/community-sections', form);
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
          <h1 className="text-2xl font-bold text-ink">Comunidad</h1>
          <p className="mt-1 text-sm text-muted">
            Residencias profesionales, investigación y créditos complementarios.
          </p>
        </div>
        <Button onClick={openCreate}>Nueva sección</Button>
      </div>

      <div className="mt-6">
        <DataTable
          data={sections}
          getRowId={(s) => s.id}
          emptyMessage={loading ? 'Cargando…' : 'Aún no hay secciones.'}
          columns={[
            { header: 'Título', cell: (s) => <span className="font-medium text-ink">{s.title}</span> },
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
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar sección' : 'Nueva sección'}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Título</Label>
                <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input id="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-sm font-medium text-ink">Contenido</p>
              <RichTextEditor value={form.body} onChange={(body) => setForm({ ...form, body })} />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-ink">Documentos relacionados</p>
              <MultiSelect
                options={documents.map((d) => ({ value: d.id, label: d.title }))}
                selected={form.documentIds}
                onChange={(documentIds) => setForm({ ...form, documentIds })}
              />
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
        title="Eliminar sección"
        description={`¿Eliminar "${deleteTarget?.title}"? Esta acción no se puede deshacer.`}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await apiDelete(`/community-sections/${deleteTarget.id}`);
          await load();
        }}
      />
    </div>
  );
}
