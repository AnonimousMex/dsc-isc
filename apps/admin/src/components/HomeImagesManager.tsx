import { useEffect, useState } from 'react';
import { heroSlideSchema, type HeroSlide } from '@dsc-isc/shared';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import ImageUploader, { type MediaValue } from './ImageUploader';
import ConfirmDialog from './ConfirmDialog';
import { apiDelete, apiGet, apiPost, apiPut } from '../lib/apiClient';
const blank = { order: 0, captionCode: '', isActive: true, media: null as MediaValue | null };
export default function HomeImagesManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]),
    [loading, setLoading] = useState(true),
    [open, setOpen] = useState(false),
    [editing, setEditing] = useState<string | null>(null),
    [form, setForm] = useState(blank),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [target, setTarget] = useState<HeroSlide | null>(null);
  const load = async () => {
    setLoading(true);
    try {
      setSlides((await apiGet<HeroSlide[]>('/hero-slides')).sort((a, b) => a.order - b.order));
    } catch {
      setError('No se pudieron cargar las imágenes.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  async function save() {
    const parsed = heroSlideSchema.safeParse({
      order: form.order,
      captionCode: form.captionCode,
      isActive: form.isActive,
      mediaId: form.media?.id ?? '',
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisa los datos.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (editing) await apiPut(`/hero-slides/${editing}`, parsed.data);
      else await apiPost('/hero-slides', parsed.data);
      setOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-image-manager">
      <div className="admin-inline-heading">
        <div>
          <h3>Galería del inicio</h3>
          <p>Ordena las imágenes con el campo de posición. Activa solo las que quieras mostrar.</p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditing(null);
            setForm({
              ...blank,
              order: slides.length ? Math.max(...slides.map((x) => x.order)) + 1 : 0,
            });
            setError('');
            setOpen(true);
          }}
        >
          <Plus size={16} /> Añadir imagen
        </Button>
      </div>
      {error && !open && (
        <p role="alert" className="admin-alert">
          {error}
        </p>
      )}
      {loading && (
        <p role="status" className="admin-help">
          Cargando imágenes…
        </p>
      )}
      <div className="admin-photo-grid">
        {slides.map((slide) => (
          <article key={slide.id}>
            <img src={slide.media.url} alt={slide.media.alt ?? slide.captionCode} />
            <div>
              <span className={slide.isActive ? 'admin-badge' : 'admin-badge muted'}>
                {slide.isActive ? 'Visible' : 'Oculta'}
              </span>
              <p>{slide.captionCode || 'Sin descripción'}</p>
              <small>Posición {slide.order + 1}</small>
              <div className="admin-photo-actions">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(slide.id);
                    setForm({
                      order: slide.order,
                      captionCode: slide.captionCode,
                      isActive: slide.isActive,
                      media: { id: slide.media.id, url: slide.media.url },
                    });
                    setError('');
                    setOpen(true);
                  }}
                >
                  <Pencil size={13} /> Editar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Eliminar ${slide.captionCode || 'imagen'}`}
                  onClick={() => setTarget(slide)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!loading && !slides.length && (
        <p className="admin-empty">
          Todavía no hay imágenes publicadas. Añade la primera para personalizar el inicio.
        </p>
      )}
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!busy) setOpen(value);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar imagen' : 'Añadir imagen'}</DialogTitle>
            <DialogDescription>
              La imagen se mostrará en el carrusel de la página principal al guardar.
            </DialogDescription>
          </DialogHeader>
          <fieldset disabled={busy} className="admin-form-stack">
            <label>
              Descripción breve
              <input
                value={form.captionCode}
                onChange={(e) => setForm({ ...form, captionCode: e.target.value })}
                placeholder="Ej. Laboratorio de redes"
              />
            </label>
            <label>
              Posición (la primera es 1)
              <input
                type="number"
                min="1"
                value={form.order + 1}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) - 1 })}
              />
            </label>
            <ImageUploader
              value={form.media}
              onChange={(media) => setForm({ ...form, media })}
              label="Fotografía"
            />
            <label className="admin-check">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />{' '}
              Mostrar en el inicio
            </label>
          </fieldset>
          {error && (
            <p role="alert" className="admin-alert">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={busy} onClick={save}>
              {busy ? 'Guardando…' : 'Guardar imagen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!target}
        onOpenChange={(value) => {
          if (!value) setTarget(null);
        }}
        title="Eliminar imagen"
        description="La imagen dejará de aparecer en el inicio. Esta acción no cambia las demás fotografías."
        onConfirm={async () => {
          if (target) {
            await apiDelete(`/hero-slides/${target.id}`);
            await load();
          }
        }}
      />
    </div>
  );
}
