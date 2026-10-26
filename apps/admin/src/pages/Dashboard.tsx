import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Image,
  Type,
  Palette,
  Sparkles,
  BookOpen,
  Users,
  Newspaper,
  FlaskConical,
} from 'lucide-react';
import type { DscDocument, News, Subject, TeacherSummary } from '@dsc-isc/shared';
import { apiGet } from '../lib/apiClient';
const tasks = [
  {
    title: 'Cambiar textos',
    text: 'Título del inicio, descripción y pie de página.',
    tab: 'textos',
    icon: Type,
  },
  {
    title: 'Actualizar fotos',
    text: 'Imágenes del inicio y de cada pestaña.',
    tab: 'fotos',
    icon: Image,
  },
  {
    title: 'Ajustar colores',
    text: 'Botones, acentos y fondos del sitio.',
    tab: 'colores',
    icon: Palette,
  },
  {
    title: 'Configurar animaciones',
    text: 'Fondos, figuras y tiempos de avance.',
    tab: 'animaciones',
    icon: Sparkles,
  },
];
export default function Dashboard() {
  const [metrics, setMetrics] = useState<number[] | null>(null),
    [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    Promise.all([
      apiGet<TeacherSummary[]>('/teachers'),
      apiGet<Subject[]>('/subjects'),
      apiGet<DscDocument[]>('/documents'),
      apiGet<News[]>('/news'),
    ])
      .then(([t, s, d, n]) => {
        if (!alive) return;
        const threshold = new Date();
        threshold.setMonth(threshold.getMonth() - 6);
        setMetrics([
          t.filter((x) => x.isActive).length,
          s.filter((x) => !x.teacherIds.length).length,
          d.filter((x) => new Date(x.updatedAt) < threshold).length,
          n.filter((x) => !x.isPublished).length,
        ]);
      })
      .catch(() => {
        if (alive)
          setError(
            'No pudimos cargar el resumen. Puedes seguir editando el contenido desde el menú.',
          );
      });
    return () => {
      alive = false;
    };
  }, []);
  return (
    <div>
      <div className="admin-page-heading">
        <div>
          <h1>¿Qué quieres actualizar?</h1>
          <p>Elige una tarea o abre la sección que necesitas desde el menú.</p>
        </div>
      </div>
      <div className="admin-task-grid">
        {tasks.map((task) => (
          <Link to={`/configuracion?tab=${task.tab}`} key={task.tab} className="admin-task">
            <span>
              <task.icon size={21} />
            </span>
            <ArrowUpRight className="task-arrow" size={17} />
            <h2>{task.title}</h2>
            <p>{task.text}</p>
          </Link>
        ))}
      </div>
      <section className="admin-section">
        <h2>Estado del contenido</h2>
        <p className="admin-help">
          Un vistazo a lo que ya está publicado y lo que conviene revisar.
        </p>
        {error && (
          <p role="alert" className="admin-alert">
            {error}
          </p>
        )}
        <div className="admin-metrics">
          {[
            'Docentes activos',
            'Materias sin docente',
            'Documentos con más de 6 meses',
            'Noticias en borrador',
          ].map((label, i) => (
            <Link to={['/docentes', '/materias', '/normateca', '/noticias'][i]} key={label}>
              <strong>{metrics?.[i] ?? '—'}</strong>
              <span>
                {label}
                <ArrowUpRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="admin-section">
        <h2>Editar una página</h2>
        <div className="admin-page-links">
          {[
            { to: '/nosotros', label: 'Historia, misión y valores', icon: BookOpen },
            { to: '/docentes', label: 'Directorio de docentes', icon: Users },
            { to: '/laboratorios', label: 'Espacios y equipamiento', icon: FlaskConical },
            { to: '/noticias', label: 'Noticias y publicaciones', icon: Newspaper },
          ].map((item) => (
            <Link to={item.to} key={item.to}>
              <item.icon size={18} />
              {item.label}
              <ArrowUpRight size={16} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
