import { useEffect, useState } from 'react';
import type { SiteConfig } from '@dsc-isc/shared';
import { apiGet, apiPut } from '../lib/apiClient';
import { useAuth } from '../lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import ImageUploader, { type MediaValue } from './ImageUploader';
export default function HeroImageField({
  configKey,
  title = 'Imagen de cabecera',
  description = 'Se guarda al elegir una foto. Al quitarla se usará la presentación predeterminada de la página.',
}: {
  configKey: string;
  title?: string;
  description?: string;
}) {
  const [media, setMedia] = useState<MediaValue | null>(null),
    [saving, setSaving] = useState(false),
    [ready, setReady] = useState(false),
    [saved, setSaved] = useState(false),
    [error, setError] = useState('');
  const { user } = useAuth();
  const canEdit = user?.role === 'SUPERADMIN' || user?.role === 'EDITOR';
  useEffect(() => {
    let alive = true;
    setReady(false);
    setMedia(null);
    setError('');
    apiGet<SiteConfig[]>('/site-config')
      .then((config) => {
        if (!alive) return;
        const url = config.find((c) => c.key === configKey)?.value;
        setMedia(typeof url === 'string' && url ? { id: '', url } : null);
        setReady(true);
      })
      .catch(() => {
        if (alive) setError('No se pudo cargar la fotografía. Recarga antes de editar.');
      });
    return () => {
      alive = false;
    };
  }, [configKey]);
  async function change(next: MediaValue | null) {
    if (saving || !canEdit) return;
    const previous = media;
    setMedia(next);
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      await apiPut(`/site-config/${configKey}`, { value: next?.url ?? '' });
      setSaved(true);
    } catch (e) {
      setMedia(previous);
      setError(e instanceof Error ? e.message : 'No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted">{description}</p>
        <fieldset disabled={!ready || saving || !canEdit}>
          <ImageUploader value={media} onChange={change} label="Fotografía" />
        </fieldset>
        {saving && (
          <p role="status" className="admin-help">
            Guardando fotografía…
          </p>
        )}
        {saved && !saving && (
          <p role="status" className="admin-success">
            Fotografía guardada.
          </p>
        )}
        {error && (
          <p role="alert" className="admin-alert">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
