import { createBrowserRouter } from 'react-router-dom';
import AdminLayout from './layout/AdminLayout';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import Forbidden from './pages/Forbidden';
import Login from './pages/Login';
import Nosotros from './pages/Nosotros';
import OfertaEducativa from './pages/OfertaEducativa';
import Materias from './pages/Materias';
import Docentes from './pages/Docentes';
import Laboratorios from './pages/Laboratorios';
import Especialidades from './pages/Especialidades';
import Normateca from './pages/Normateca';
import Comunidad from './pages/Comunidad';
import Noticias from './pages/Noticias';
import Configuracion from './pages/Configuracion';
import Usuarios from './pages/Usuarios';
import Auditoria from './pages/Auditoria';
import { AuthGate, RequireAuth, RequireAuthOnly, RequireRole } from './router/guards';

export const router = createBrowserRouter([
  {
    element: <AuthGate />,
    children: [
      { path: '/login', element: <Login /> },
      {
        element: <RequireAuthOnly />,
        children: [{ path: '/cambiar-contrasena', element: <ChangePassword /> }],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: '/', element: <Dashboard /> },
              { path: '/nosotros', element: <Nosotros /> },
              { path: '/oferta-educativa', element: <OfertaEducativa /> },
              { path: '/materias', element: <Materias /> },
              { path: '/docentes', element: <Docentes /> },
              { path: '/laboratorios', element: <Laboratorios /> },
              { path: '/especialidades', element: <Especialidades /> },
              { path: '/normateca', element: <Normateca /> },
              { path: '/comunidad', element: <Comunidad /> },
              { path: '/noticias', element: <Noticias /> },
              { path: '/configuracion', element: <Configuracion /> },
              { path: '/403', element: <Forbidden /> },
              {
                element: <RequireRole roles={['SUPERADMIN']} />,
                children: [
                  { path: '/usuarios', element: <Usuarios /> },
                  { path: '/auditoria', element: <Auditoria /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);
