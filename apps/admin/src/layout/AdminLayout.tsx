import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  FileText,
  FlaskConical,
  GraduationCap,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  Newspaper,
  UserCog,
  Users,
  UsersRound,
  ExternalLink,
  Palette,
} from 'lucide-react';
import type { Role } from '@dsc-isc/shared';
import { useAuth } from '../lib/AuthContext';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
const groups = [
  {
    label: 'TU SITIO',
    items: [
      { to: '/', label: 'Inicio del panel', icon: LayoutDashboard },
      { to: '/configuracion', label: 'Diseño y contenido', icon: Palette },
    ],
  },
  {
    label: 'PÁGINAS Y CONTENIDO',
    items: [
      { to: '/nosotros', label: 'Conócenos', icon: BookOpen },
      { to: '/oferta-educativa', label: 'La carrera', icon: GraduationCap },
      { to: '/materias', label: 'Materias y retícula', icon: Network },
      { to: '/docentes', label: 'Docentes', icon: Users },
      { to: '/laboratorios', label: 'Laboratorios', icon: FlaskConical },
      { to: '/especialidades', label: 'Especialidades', icon: Award },
      { to: '/comunidad', label: 'Comunidad', icon: UsersRound },
      { to: '/noticias', label: 'Noticias', icon: Newspaper },
      { to: '/normateca', label: 'Documentos', icon: FileText },
      {
        to: '/egresados',
        label: 'Egresados',
        icon: GraduationCap,
        roles: ['SUPERADMIN', 'EDITOR'] as Role[],
      },
    ],
  },
  {
    label: 'ADMINISTRACIÓN',
    items: [
      {
        to: '/usuarios',
        label: 'Usuarios y accesos',
        icon: UserCog,
        roles: ['SUPERADMIN'] as Role[],
      },
      {
        to: '/auditoria',
        label: 'Historial de cambios',
        icon: History,
        roles: ['SUPERADMIN'] as Role[],
      },
    ],
  },
];
const roleNames = { SUPERADMIN: 'Administrador', EDITOR: 'Editor', VIEWER: 'Consulta' };
const siteUrl = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173';
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false),
    [error, setError] = useState('');
  useEffect(() => setOpen(false), [pathname]);
  const current =
    groups.flatMap((g) => g.items).find((i) => i.to === pathname)?.label ??
    'Panel de administración';
  const sidebar = (
    <>
      <div className="admin-brand">
        <img src="/logos/dsc-logo.png" alt="Ingeniería en Sistemas Computacionales" />
        <div>
          <strong>ISC · Administración</strong>
          <span>Gestiona el sitio de la carrera</span>
        </div>
      </div>
      <nav aria-label="Navegación del panel">
        {groups.map((group) => (
          <div className="admin-nav-group" key={group.label}>
            <p>{group.label}</p>
            {group.items
              .filter((i) => !('roles' in i) || !i.roles || (user && i.roles.includes(user.role)))
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => (isActive ? 'selected' : '')}
                >
                  <item.icon size={17} />
                  {item.label}
                </NavLink>
              ))}
          </div>
        ))}
      </nav>
      <a href={siteUrl} target="_blank" rel="noreferrer" className="admin-site-link">
        <ExternalLink size={16} /> Abrir página pública
      </a>
    </>
  );
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">{sidebar}</aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <div>
            <button
              type="button"
              className="admin-menu"
              aria-label="Abrir menú"
              onClick={() => setOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div>
              <span className="admin-breadcrumb">Panel / {current}</span>
              <p>Ingeniería en Sistemas Computacionales</p>
            </div>
          </div>
          <div className="admin-user">
            <span className="admin-avatar">{user?.name.slice(0, 1)}</span>
            <div>
              <strong>{user?.name}</strong>
              <span>{user ? roleNames[user.role] : ''}</span>
            </div>
            <button
              type="button"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              onClick={async () => {
                try {
                  await logout();
                  navigate('/login', { replace: true });
                } catch {
                  setError('No se pudo cerrar la sesión. Intenta de nuevo.');
                }
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        {error && (
          <p role="alert" className="admin-alert">
            {error}
          </p>
        )}
        <main className="admin-main">
          <Outlet />
        </main>
        <footer className="admin-panel-footer">
          Panel de contenido · ISC <span>Los cambios guardados se publican en el sitio.</span>
        </footer>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="admin-mobile-drawer">
          <DialogTitle className="sr-only">Navegación del panel</DialogTitle>
          {sidebar}
        </DialogContent>
      </Dialog>
    </div>
  );
}
