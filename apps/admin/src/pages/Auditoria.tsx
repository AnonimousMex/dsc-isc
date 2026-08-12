import { useEffect, useState } from 'react';
import type { AuditLog } from '@dsc-isc/shared';
import DataTable from '../components/DataTable';
import { apiGet } from '../lib/apiClient';

const ACTION_LABEL: Record<string, string> = {
  CREATE: 'Creó',
  UPDATE: 'Actualizó',
  DELETE: 'Eliminó',
};

export default function Auditoria() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<AuditLog[]>('/audit-logs?take=100').then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-ink">Auditoría</h1>
        <p className="mt-1 text-sm text-muted">
          Registro de las últimas 100 mutaciones realizadas desde el sistema. Exclusivo de SUPERADMIN.
        </p>
      </div>

      <div className="mt-6">
        <DataTable
          data={logs}
          getRowId={(l) => l.id}
          emptyMessage={loading ? 'Cargando…' : 'Sin actividad registrada.'}
          columns={[
            { header: 'Fecha', cell: (l) => new Date(l.createdAt).toLocaleString('es-MX') },
            { header: 'Usuario', cell: (l) => l.userName },
            { header: 'Acción', cell: (l) => ACTION_LABEL[l.action] ?? l.action },
            { header: 'Entidad', cell: (l) => l.entityType },
            { header: 'ID', cell: (l) => <span className="font-mono text-xs">{l.entityId}</span> },
          ]}
        />
      </div>
    </div>
  );
}
