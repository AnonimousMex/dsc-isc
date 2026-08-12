import { useEffect, useState } from 'react';
import type { DscDocument, News, Subject, TeacherSummary } from '@dsc-isc/shared';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { apiGet } from '../lib/apiClient';

const STALE_DOCUMENT_MONTHS = 6;

interface Metrics {
  activeTeachers: number;
  subjectsWithoutTeacher: number;
  staleDocuments: number;
  draftNews: number;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [teachers, subjects, documents, news] = await Promise.all([
        apiGet<TeacherSummary[]>('/teachers'),
        apiGet<Subject[]>('/subjects'),
        apiGet<DscDocument[]>('/documents'),
        apiGet<News[]>('/news'),
      ]);
      if (cancelled) return;

      const staleThreshold = new Date();
      staleThreshold.setMonth(staleThreshold.getMonth() - STALE_DOCUMENT_MONTHS);

      setMetrics({
        activeTeachers: teachers.filter((t) => t.isActive).length,
        subjectsWithoutTeacher: subjects.filter((s) => s.teacherIds.length === 0).length,
        staleDocuments: documents.filter((d) => new Date(d.updatedAt) < staleThreshold).length,
        draftNews: news.filter((n) => !n.isPublished).length,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    { label: 'Docentes activos', value: metrics?.activeTeachers },
    { label: 'Materias sin profesor asignado', value: metrics?.subjectsWithoutTeacher },
    { label: `Documentos sin actualizar (${STALE_DOCUMENT_MONTHS}+ meses)`, value: metrics?.staleDocuments },
    { label: 'Noticias en borrador', value: metrics?.draftNews },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Resumen rápido del estado del contenido publicado.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardTitle>{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-bold text-ink">{card.value ?? '—'}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
