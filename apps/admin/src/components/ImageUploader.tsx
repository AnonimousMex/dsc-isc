import { useRef, useState } from 'react';
import type { MediaKind } from '@dsc-isc/shared';
import { apiPost, ApiError, uploadFile } from '../lib/apiClient';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export interface MediaValue {
  id: string;
  url: string;
}

interface ImageUploaderProps {
  value: MediaValue | null;
  onChange: (media: MediaValue | null) => void;
  kind?: MediaKind;
  label?: string;
}

/**
 * Dos formas de asociar un archivo a una entidad (sección 6.4): subirlo
 * (se guarda en apps/api/storage/uploads/ vía el StorageAdapter activo) o
 * pegar un enlace externo (se guarda tal cual, sin descargarlo).
 */
export default function ImageUploader({ value, onChange, kind = 'IMAGE', label = 'Imagen' }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const media = await uploadFile(file);
      onChange(media);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo subir el archivo');
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExternalSubmit = async () => {
    if (!externalUrl) return;
    setError(null);
    setBusy(true);
    try {
      const media = await apiPost<MediaValue>('/media/external', { url: externalUrl, kind });
      onChange(media);
      setExternalUrl('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'El enlace no es válido');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink">{label}</p>

      {value && (
        <div className="mb-3 flex items-center gap-3 rounded-md border border-line bg-elevated p-3">
          {kind === 'IMAGE' ? (
            <img src={value.url} alt="" className="h-16 w-16 rounded object-cover" />
          ) : (
            <p className="flex-1 truncate font-mono text-xs text-muted">{value.url}</p>
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => onChange(null)}>
            Quitar
          </Button>
        </div>
      )}

      <Tabs defaultValue="upload">
        <TabsList>
          <TabsTrigger value="upload">Subir archivo</TabsTrigger>
          <TabsTrigger value="link">Usar enlace</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <input
            ref={fileInputRef}
            type="file"
            accept={kind === 'IMAGE' ? 'image/*' : kind === 'VIDEO' ? 'video/*' : 'application/pdf'}
            onChange={handleFileChange}
            disabled={busy}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-surface"
          />
        </TabsContent>
        <TabsContent value="link">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://..."
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              disabled={busy}
            />
            <Button type="button" onClick={handleExternalSubmit} disabled={busy || !externalUrl}>
              Usar
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
