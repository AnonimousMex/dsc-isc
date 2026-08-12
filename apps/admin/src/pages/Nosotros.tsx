import { useEffect, useState } from 'react';
import { ZodError } from 'zod';
import { timelineEventSchema, type SiteConfig, type TimelineEvent } from '@dsc-isc/shared';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '../lib/apiClient';

const emptyForm = { year: '', title: '', description: '', order: 0, isActive: true };

function configValue<T>(config: SiteConfig[], key: string): T | undefined {
  return config.find((c) => c.key === key)?.value as T | undefined;
}

export default function Nosotros() {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TimelineEvent | null>(null);

  const [mision, setMision] = useState('');
  const [vision, setVision] = useState('');
  const [valores, setValores] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    const [timelineList, configList] = await Promise.all([
      apiGet<TimelineEvent[]>('/timeline'),
      apiGet<SiteConfig[]>('/site-config'),
    ]);
    setTimeline(timelineList);
    setMision(configValue<string>(configList, 'nosotros.mision') ?? '');
    setVision(configValue<string>(configList, 'nosotros.vision') ?? '');
    setValores((configValue<string[]>(configList, 'nosotros.valores') ?? []).join('\n'));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, order: timeline.length });
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (event: TimelineEvent) => {
    setEditingId(event.id);
    setForm({
      year: event.year,
      title: event.title,
      description: event.description,
      order: event.order,
      isActive: event.isActive,
    });
    setError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      timelineEventSchema.parse(form);
    } catch (err) {
      setError(err instanceof ZodError ? (err.issues[0]?.message ?? 'Datos inválidos') : 'Datos inválidos');
      return;
    }
    try {
      if (editingId) await apiPut(`/timeline/${editingId}`, form);
      else await apiPost('/timeline', form);
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
      await apiPut('/site-config/nosotros.mision', { value: mision });
      await apiPut('/site-config/nosotros.vision', { value: vision });
      await apiPut('/site-config/nosotros.valores', {
        value: valores.split('\n').map((v) => v.trim()).filter(Boolean),
      });
      setConfigSaved(true);
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Nosotros</h1>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Misión, visión y valores</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mision">Misión</Label>
            <textarea
              id="mision"
              rows={3}
              className="rounded-md border border-line bg-surface px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
              value={mision}
              onChange={(e) => setMision(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vision">Visión</Label>
            <textarea
              id="vision"
              rows={3}
              className="rounded-md border border-line bg-surface px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
              value={vision}
              onChange={(e) => setVision(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="valores">Valores (uno por línea)</Label>
            <textarea
              id="valores"
              rows={4}
              className="rounded-md border border-line bg-surface px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
              value={valores}
              onChange={(e) => setValores(e.target.value)}
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

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Historia (línea de tiempo)</h2>
        <Button onClick={openCreate}>Nuevo evento</Button>
      </div>

      <div className="mt-4">
        <DataTable
          data={timeline}
          getRowId={(t) => t.id}
          emptyMessage={loading ? 'Cargando…' : 'Aún no hay eventos.'}
          columns={[
            { header: 'Año', cell: (t) => <span className="font-mono">{t.year}</span> },
            { header: 'Título', cell: (t) => t.title },
            { header: 'Orden', cell: (t) => t.order },
            { header: 'Activo', cell: (t) => (t.isActive ? 'Sí' : 'No') },
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar evento' : 'Nuevo evento'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="year">Año</Label>
                <Input id="year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="order">Orden</Label>
                <Input
                  id="order"
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="titleEv">Título</Label>
              <Input id="titleEv" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="descEv">Descripción</Label>
              <textarea
                id="descEv"
                rows={3}
                className="rounded-md border border-line bg-surface px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
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
        title="Eliminar evento"
        description={`¿Eliminar "${deleteTarget?.title}"?`}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await apiDelete(`/timeline/${deleteTarget.id}`);
          await load();
        }}
      />
    </div>
  );
}
