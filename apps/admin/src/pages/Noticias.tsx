import { useEffect, useState } from 'react';
import { ZodError } from 'zod';
import { newsSchema, type News } from '@dsc-isc/shared';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import ImageUploader, { type MediaValue } from '../components/ImageUploader';
import RichTextEditor from '../components/RichTextEditor';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { apiDelete, apiGet, apiPost, apiPut, ApiError } from '../lib/apiClient';

const emptyForm = {
  slug: '',
  title: '',
  excerpt: '',
  body: '',
  coverImage: null as MediaValue | null,
  isPublished: false,
};

export default function Noticias() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<News | null>(null);

  const load = async () => {
    setLoading(true);
    setNews(await apiGet<News[]>('/news'));
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

  const openEdit = (item: News) => {
    setEditingId(item.id);
    setForm({
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt,
      body: item.body,
      coverImage: item.coverImage ? { id: item.coverImage.id, url: item.coverImage.url } : null,
      isPublished: item.isPublished,
    });
    setError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setError(null);
    const payload = {
      slug: form.slug,
      title: form.title,
      excerpt: form.excerpt,
      body: form.body,
      coverImageId: form.coverImage?.id ?? null,
      isPublished: form.isPublished,
    };
    try {
      newsSchema.parse(payload);
    } catch (err) {
      setError(err instanceof ZodError ? (err.issues[0]?.message ?? 'Datos inválidos') : 'Datos inválidos');
      return;
    }
    try {
      if (editingId) await apiPut(`/news/${editingId}`, payload);
      else await apiPost('/news', payload);
      setDialogOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Noticias</h1>
        <Button onClick={openCreate}>Nueva noticia</Button>
      </div>

      <div className="mt-6">
        <DataTable
          data={news}
          getRowId={(n) => n.id}
          emptyMessage={loading ? 'Cargando…' : 'Aún no hay noticias.'}
          columns={[
            { header: 'Título', cell: (n) => <span className="font-medium text-ink">{n.title}</span> },
            {
              header: 'Estado',
              cell: (n) => (
                <span className={n.isPublished ? 'text-green-700' : 'text-muted'}>
                  {n.isPublished ? 'Publicada' : 'Borrador'}
                </span>
              ),
            },
          ]}
          actions={(n) => (
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => openEdit(n)}>
                Editar
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(n)}>
                Eliminar
              </Button>
            </div>
          )}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar noticia' : 'Nueva noticia'}</DialogTitle>
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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="excerpt">Resumen</Label>
              <textarea
                id="excerpt"
                rows={2}
                className="rounded-md border border-line bg-surface px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              />
            </div>

            <ImageUploader
              value={form.coverImage}
              onChange={(coverImage) => setForm({ ...form, coverImage })}
              label="Imagen de portada"
            />

            <div>
              <p className="mb-1.5 text-sm font-medium text-ink">Contenido</p>
              <RichTextEditor value={form.body} onChange={(body) => setForm({ ...form, body })} />
            </div>

            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              />
              Publicada (visible en el sitio)
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
        title="Eliminar noticia"
        description={`¿Eliminar "${deleteTarget?.title}"? Esta acción no se puede deshacer.`}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await apiDelete(`/news/${deleteTarget.id}`);
          await load();
        }}
      />
    </div>
  );
}
