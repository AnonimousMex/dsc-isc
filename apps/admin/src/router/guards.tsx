import { Navigate, Outlet } from 'react-router-dom';
import type { Role } from '@dsc-isc/shared';
import { useAuth } from '../lib/AuthContext';

/** Bloquea toda la app hasta que sepamos si hay sesión (evita parpadeo al recargar). */
export function AuthGate() {
  const { loading } = useAuth();
  if (loading) return null;
  return <Outlet />;
}

/** Requiere sesión activa; si debe cambiar contraseña, lo manda a esa pantalla primero. */
export function RequireAuth() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword) return <Navigate to="/cambiar-contrasena" replace />;
  return <Outlet />;
}

/** Solo exige sesión activa, sin redirigir por mustChangePassword (para esa misma pantalla). */
export function RequireAuthOnly() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RequireRole({ roles }: { roles: Role[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/403" replace />;
  return <Outlet />;
}
