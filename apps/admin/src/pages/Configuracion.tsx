import { useEffect, useState } from 'react';
import { ZodError } from 'zod';
import { heroSlideSchema, type HeroSlide, type SiteConfig } from '@dsc-isc/shared';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import ImageUploader, { type MediaValue } from '../components/ImageUploader';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { apiDelete, apiGet, apiPost, apiPut, ApiError } from '../lib/apiClient';

const emptyForm = { order: 0, media: null as MediaValue | null, captionCode: '', isActive: true };

function configValue<T>(config: SiteConfig[], key: string): T | undefined {
  return config.find((c) => c.key === key)?.value as T | undefined;
}

export default function Configuracion() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HeroSlide | null>(null);

  const [titulacion, setTitulacion] = useState('');
  const [titulosRecibidos, setTitulosRecibidos] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    const [slideList, configList] = await Promise.all([
      apiGet<HeroSlide[]>('/hero-slides'),
      apiGet<SiteConfig[]>('/site-config'),
    ]);
    setSlides(slideList);
    setTitulacion(configValue<string>(configList, 'egresados.titulacion') ?? '');
    setTitulosRecibidos(configValue<string>(configList, 'egresados.titulosRecibidos') ?? '');
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, order: slides.length });
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (slide: HeroSlide) => {
    setEditingId(slide.id);
    setForm({
      order: slide.order,
      media: { id: slide.media.id, url: slide.media.url },
      captionCode: slide.captionCode,
      isActive: slide.isActive,
    });
    setError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setError(null);
    const payload = { order: form.order, mediaId: form.media?.id ?? '', captionCode: form.captionCode, isActive: form.isActive };
    try {
      heroSlideSchema.parse(payload);
    } catch (err) {
      setError(err instanceof ZodError ? (err.issues[0]?.message ?? 'Datos inválidos') : 'Datos inválidos');
      return;
    }
    try {
      if (editingId) await apiPut(`/hero-slides/${editingId}`, payload);
      else await apiPost('/hero-slides', payload);
      setDialogOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar');
    }
  };

  const saveConfig = async () => {
    setSavingConfig(true);
    setConfigSaved(false);
    try {
      await apiPut('/site-config/egresados.titulacion', { value: titulacion });
      await apiPut('/site-config/egresados.titulosRecibidos', { value: titulosRecibidos });
      setConfigSaved(true);
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Configuración</h1>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Hero del inicio</h2>
        <Button onClick={openCreate}>Nuevo slide</Button>
      </div>
      <div className="mt-4">
        <DataTable
          data={slides}
          getRowId={(s) => s.id}
          emptyMessage={loading ? 'Cargando…' : 'Aún no hay slides.'}
          columns={[
            { header: 'Orden', cell: (s) => s.order },
            {
              header: 'Media',
              cell: (s) => <img src={s.media.url} alt="" className="h-10 w-16 rounded object-cover" />,
            },
            { header: 'Texto', cell: (s) => <span className="font-mono text-xs">{s.captionCode}</span> },
            { header: 'Activo', cell: (s) => (s.isActive ? 'Sí' : 'No') },
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

      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Egresados</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="titulacion">Titulación</Label>
            <textarea
              id="titulacion"
              rows={3}
              className="rounded-md border border-line bg-surface px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
              value={titulacion}
              onChange={(e) => setTitulacion(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="titulos">Títulos recibidos</Label>
            <textarea
              id="titulos"
              rows={3}
              className="rounded-md border border-line bg-surface px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
              value={titulosRecibidos}
              onChange={(e) => setTitulosRecibidos(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={saveConfig} disabled={savingConfig}>
              {savingConfig ? 'Guardando…' : 'Guardar'}
            </Button>
            {configSaved && <span className="text-sm text-green-700">Guardado.</span>}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar slide' : 'Nuevo slide'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="order">Orden</Label>
                <Input
                  id="order"
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="captionCode">Texto (ej. "01 · LAB. DE REDES")</Label>
                <Input
                  id="captionCode"
                  value={form.captionCode}
                  onChange={(e) => setForm({ ...form, captionCode: e.target.value })}
                />
              </div>
            </div>
            <ImageUploader value={form.media} onChange={(media) => setForm({ ...form, media })} label="Imagen o video" />
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Activo
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
        title="Eliminar slide"
        description="¿Eliminar este slide del hero?"
        onConfirm={async () => {
          if (!deleteTarget) return;
          await apiDelete(`/hero-slides/${deleteTarget.id}`);
          await load();
        }}
      />
    </div>
  );
}
