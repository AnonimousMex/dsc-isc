import { useEffect, useState } from 'react';
import type { SiteConfig } from '@dsc-isc/shared';
import { apiGet, apiPut } from '../lib/apiClient';
import { Button } from './ui/button';
export default function GraduationContentEditor() {
  const [form, setForm] = useState({ titulacion: '', titulosRecibidos: '' }),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(''),
    [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    apiGet<SiteConfig[]>('/site-config')
      .then((list) => {
        if (!alive) return;
        const get = (key: string) => {
          const value = list.find((c) => c.key === key)?.value;
          return typeof value === 'string' ? value : '';
        };
        setForm({
          titulacion: get('egresados.titulacion'),
          titulosRecibidos: get('egresados.titulosRecibidos'),
        });
        setReady(true);
      })
      .catch(() => {
        if (alive) setError('No se pudieron cargar los textos de titulación.');
      });
    return () => {
      alive = false;
    };
  }, []);
  return (
    <details className="admin-graduation-texts">
      <summary>Editar información de titulación</summary>
      <p className="admin-help">Estos textos aparecen en la página pública de Egresados.</p>
      <fieldset disabled={!ready || busy} className="admin-form-stack">
        {[
          { key: 'titulacion', label: 'Titulación' },
          { key: 'titulosRecibidos', label: 'Títulos recibidos' },
        ].map((item) => (
          <label key={item.key}>
            {item.label}
            <textarea
              rows={3}
              value={form[item.key as keyof typeof form]}
              onChange={(e) => {
                setForm({ ...form, [item.key]: e.target.value });
                setStatus('');
              }}
            />
          </label>
        ))}
        <Button
          type="button"
          disabled={!ready || busy}
          onClick={async () => {
            setBusy(true);
            setStatus('');
            setError('');
            try {
              await apiPut('/site-config/egresados.titulacion', { value: form.titulacion });
              await apiPut('/site-config/egresados.titulosRecibidos', {
                value: form.titulosRecibidos,
              });
              setStatus('Información de titulación guardada.');
            } catch {
              setError('No se pudo completar el guardado. Reintenta para guardar ambos textos.');
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? 'Guardando…' : 'Guardar información'}
        </Button>
      </fieldset>
      {status && (
        <p role="status" className="admin-success">
          {status}
        </p>
      )}
      {error && (
        <p role="alert" className="admin-alert">
          {error}
        </p>
      )}
    </details>
  );
}
