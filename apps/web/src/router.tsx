import { createBrowserRouter } from 'react-router-dom';
import RootLayout from './layout/RootLayout';
import PagePlaceholder from './pages/PagePlaceholder';
import Home from './pages/Home';
import Nosotros from './pages/Nosotros';
import OfertaEducativa from './pages/OfertaEducativa';
import Docentes from './pages/Docentes';
import DocenteDetalle from './pages/DocenteDetalle';
import Laboratorios from './pages/Laboratorios';
import LaboratorioDetalle from './pages/LaboratorioDetalle';
import Especialidades from './pages/Especialidades';
import EspecialidadDetalle from './pages/EspecialidadDetalle';
import Normateca from './pages/Normateca';
import Comunidad from './pages/Comunidad';
import Egresados from './pages/Egresados';
import Noticias from './pages/Noticias';
import NoticiaDetalle from './pages/NoticiaDetalle';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'nosotros', element: <Nosotros /> },
      { path: 'oferta-educativa/:programSlug', element: <OfertaEducativa /> },
      { path: 'especialidades', element: <Especialidades /> },
      { path: 'especialidades/:slug', element: <EspecialidadDetalle /> },
      { path: 'docentes', element: <Docentes /> },
      { path: 'docentes/:slug', element: <DocenteDetalle /> },
      { path: 'laboratorios', element: <Laboratorios /> },
      { path: 'laboratorios/:slug', element: <LaboratorioDetalle /> },
      { path: 'normateca', element: <Normateca /> },
      { path: 'comunidad', element: <Comunidad /> },
      { path: 'comunidad/:seccion', element: <Comunidad /> },
      { path: 'egresados', element: <Egresados /> },
      { path: 'noticias', element: <Noticias /> },
      { path: 'noticias/:slug', element: <NoticiaDetalle /> },
      { path: '*', element: <PagePlaceholder eyebrow="Error 404" title="Página no encontrada" /> },
    ],
  },
]);
