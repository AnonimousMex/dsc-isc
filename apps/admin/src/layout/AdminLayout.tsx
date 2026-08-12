import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  FileText,
  FlaskConical,
  GraduationCap,
  History,
  LayoutDashboard,
  LogOut,
  Network,
  Newspaper,
  Settings,
  UserCog,
  Users,
  UsersRound,
} from 'lucide-react';
import type { Role } from '@dsc-isc/shared';
import { useAuth } from '../lib/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/nosotros', label: 'Nosotros', icon: BookOpen },
  { to: '/oferta-educativa', label: 'Oferta educativa', icon: GraduationCap },
  { to: '/materias', label: 'Materias y retícula', icon: Network },
  { to: '/docentes', label: 'Docentes', icon: Users },
  { to: '/laboratorios', label: 'Laboratorios', icon: FlaskConical },
  { to: '/especialidades', label: 'Especialidades', icon: Award },
  { to: '/normateca', label: 'Normateca', icon: FileText },
  { to: '/comunidad', label: 'Comunidad', icon: UsersRound },
  { to: '/noticias', label: 'Noticias', icon: Newspaper },
  { to: '/configuracion', label: 'Configuración', icon: Settings },
  { to: '/usuarios', label: 'Usuarios', icon: UserCog, roles: ['SUPERADMIN'] },
  { to: '/auditoria', label: 'Auditoría', icon: History, roles: ['SUPERADMIN'] },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-svh">
      <aside className="flex w-64 shrink-0 flex-col border-r border-line bg-surface">
        <div className="px-5 py-6">
          <p className="font-mono text-sm font-bold uppercase tracking-widest text-ink">Sistema DSC</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role))).map(
            (item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary text-surface' : 'text-ink hover:bg-elevated'
                  }`
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            ),
          )}
        </nav>
      </aside>

      <div className="flex min-h-svh flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-surface px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-ink">{user?.name}</p>
            <p className="text-xs text-muted">
              {user?.email} · {user?.role}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-elevated hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
