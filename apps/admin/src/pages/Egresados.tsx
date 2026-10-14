import { useEffect, useState } from 'react';
import { graduateReviewSchema, type GraduateApplication, type GraduateStatus } from '@dsc-isc/shared';
import { apiGet, apiPut } from '../lib/apiClient';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import GraduateEditor from '../components/GraduateEditor';

const labels: Record<GraduateStatus, string> = { PENDING: 'Pendiente', APPROVED: 'Aprobado', REJECTED: 'Rechazado' };

export default function Egresados() {
  const [applications, setApplications] = useState<GraduateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<GraduateApplication | null>(null);
  const [editing, setEditing] = useState<GraduateApplication | null>(null);
  const [filter, setFilter] = useState<GraduateStatus | 'ALL'>('PENDING');
  const [note, setNote] = useState('');
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { setApplications(await apiGet<GraduateApplication[]>('/graduates/admin/applications')); }
    catch (err) { setError(err instanceof Error ? err.message : 'No se pudieron cargar las solicitudes'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const review = async (status: GraduateStatus) => {
    if (!selected || busy) return;
    setError(null);
    const parsed = graduateReviewSchema.safeParse({ status, reviewNote: note, titleVerified: verified });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Revisa la decisión'); return; }
    if (status === 'APPROVED' && !verified) { setError('Confirma que verificaste el título profesional'); return; }
    setBusy(true);
    try {
      await apiPut(`/graduates/admin/${selected.id}/review`, parsed.data);
      setSelected(null);
      setMessage(status === 'APPROVED' ? 'Perfil aprobado y publicado.' : status === 'REJECTED' ? 'Solicitud rechazada. El perfil no es público.' : 'Perfil retirado de la web y devuelto a revisión.');
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo guardar la revisión'); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Egresados</h1>
      <p className="mt-2 text-sm text-muted">Revisa el título profesional y la información de cada solicitud. Solo los perfiles aprobados se muestran en la web.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((status) => <Button key={status} variant={filter === status ? 'default' : 'outline'} onClick={() => setFilter(status)}>{status === 'ALL' ? 'Todos' : labels[status]} ({applications.filter((item) => status === 'ALL' || item.status === status).length})</Button>)}
      </div>
      {message && <p role="status" className="mt-4 text-sm text-primary">{message}</p>}
      {error && !selected && <p role="alert" className="mt-4 text-sm text-red-700">{error} <button onClick={() => { setError(null); void load(); }} className="underline">Reintentar</button></p>}
      {loading ? <p role="status" className="mt-8 text-muted">Cargando solicitudes…</p> : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-elevated text-muted"><tr><th className="p-4">Egresado</th><th className="p-4">Titulación</th><th className="p-4">Estado</th><th className="p-4">Registro</th><th className="p-4">Acciones</th></tr></thead>
            <tbody>{applications.filter((item) => filter === 'ALL' || item.status === filter).map((item) => <tr key={item.id} className="border-t border-line">
              <td className="p-4"><p className="font-semibold text-ink">{item.fullName}</p><p className="text-muted">{item.email}</p><p className="text-muted">{item.headline}</p></td>
              <td className="p-4">{item.graduationYear}</td><td className="p-4">{labels[item.status]}</td><td className="p-4">{new Date(item.createdAt).toLocaleDateString('es-MX')}</td>
              <td className="p-4"><div className="flex flex-wrap gap-2">{item.status === 'APPROVED' && <Button variant="outline" onClick={() => setEditing(item)}>Editar</Button>}<Button variant="outline" onClick={() => { setSelected(item); setNote(item.reviewNote ?? ''); setVerified(false); setError(null); }}>Revisar solicitud</Button></div></td>
            </tr>)}</tbody>
          </table>
          {applications.filter((item) => filter === 'ALL' || item.status === filter).length === 0 && <p className="p-6 text-muted">No hay solicitudes en este estado.</p>}
        </div>
      )}
      {editing && <GraduateEditor key={editing.id} graduate={editing} onClose={() => setEditing(null)} onSaved={async () => { setMessage('Perfil actualizado.'); await load(); }} />}
      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open && !busy) { setSelected(null); setError(null); } }}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Verificar egresado</DialogTitle></DialogHeader>
          {selected && <div className="space-y-5">
            <div className="flex items-start gap-4">
              {selected.photoUrl && <img src={selected.photoUrl} alt={selected.fullName} className="h-20 w-20 rounded-lg object-cover" />}
              <div><h2 className="text-xl font-bold text-ink">{selected.fullName}</h2><p className="text-muted">{selected.headline}</p><p className="text-sm text-muted">{selected.email} · Titulación {selected.graduationYear}</p><p className="text-sm text-muted">{selected.city}</p><p className="mt-2 text-sm font-medium">{labels[selected.status]}</p></div>
            </div>
            <div className="rounded-md border border-line bg-elevated p-4">
              <h3 className="font-semibold text-ink">Título profesional</h3>
              <p className="mt-2 text-sm text-muted">Confirma que el documento acredita la titulación de ISC y corresponde a la persona registrada.</p>
              <a href={selected.diplomaUrl} className="mt-3 inline-block text-sm text-accent underline">Descargar título para verificar</a>
            </div>
            <div><h3 className="font-semibold text-ink">Sobre mí</h3><p className="mt-2 whitespace-pre-wrap text-sm text-muted">{selected.bio}</p></div>
            <div><h3 className="font-semibold text-ink">Experiencia</h3><p className="mt-2 whitespace-pre-wrap text-sm text-muted">{selected.experience || 'Sin experiencia registrada.'}</p></div>
            <div className="flex flex-wrap gap-4 text-sm text-accent">
              {selected.curriculumUrl && <a href={selected.curriculumUrl} className="underline">Descargar currículum</a>}
              {(['website', 'linkedin', 'github', 'facebook', 'instagram'] as const).map((key) => selected[key] && <a key={key} href={selected[key]!} target="_blank" rel="noopener noreferrer" className="underline">{{ website: 'Sitio web', linkedin: 'LinkedIn', github: 'GitHub', facebook: 'Facebook', instagram: 'Instagram' }[key]}</a>)}
            </div>
            {selected.reviewedAt && <p className="text-xs text-muted">Última revisión: {new Date(selected.reviewedAt).toLocaleString('es-MX')}</p>}
            <label htmlFor="graduate-review-note" className="block text-sm font-medium text-ink">Observaciones / motivo de rechazo
              <textarea id="graduate-review-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} rows={3} disabled={busy} className="mt-2 w-full rounded-md border border-line p-3 text-sm" />
            </label>
            <label className="flex items-start gap-3 text-sm text-ink"><input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} disabled={busy} className="mt-1" />Verifiqué que el título corresponde al solicitante y acredita su titulación de ISC.</label>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <Button disabled={busy || !verified} onClick={() => void review('APPROVED')}>{busy ? 'Guardando…' : 'Aprobar y publicar'}</Button>
              <Button variant="destructive" disabled={busy} onClick={() => void review('REJECTED')}>Rechazar</Button>
              {selected.status !== 'PENDING' && <Button variant="outline" disabled={busy} onClick={() => void review('PENDING')}>Volver a revisión</Button>}
            </div>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
