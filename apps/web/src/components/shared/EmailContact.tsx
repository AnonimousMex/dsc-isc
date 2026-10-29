import { useId, useState } from 'react';
import { useDialogFocus } from '../../lib/useDialogFocus';

function EmailDialog({ email, onClose }: { email: string; onClose: () => void }) {
  const dialogRef = useDialogFocus(onClose);
  const titleId = useId();
  const [status, setStatus] = useState('');
  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setStatus('Correo copiado.');
    } catch {
      setStatus('No se pudo copiar automáticamente. Selecciona y copia la dirección.');
    }
  }
  return (
    <div
      className="editorial-modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="editorial-modal max-h-[calc(100svh-2rem)] w-full max-w-md overflow-y-auto border border-line/20 bg-surface p-6 text-ink"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId}>Correo de contacto</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar correo"
            className="rounded p-2 text-muted hover:text-ink"
          >
            ✕
          </button>
        </div>
        <p className="mt-5 select-all break-all text-primary">{email}</p>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={copy}
            className="rounded border border-primary/40 px-4 py-2 text-primary hover:bg-primary/10"
          >
            Copiar correo
          </button>
          <a href={`mailto:${email}`} className="text-accent underline">
            Abrir aplicación de correo
          </a>
        </div>
        <p className="mt-4 text-sm text-muted">
          Si no se abre una aplicación, copia la dirección y úsala en tu servicio de correo.
        </p>
        <p role="status" className="mt-3 text-sm text-primary">
          {status}
        </p>
      </div>
    </div>
  );
}

export default function EmailContact({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="underline"
      >
        Correo
      </button>
      {open && <EmailDialog email={email.trim()} onClose={() => setOpen(false)} />}
    </>
  );
}
