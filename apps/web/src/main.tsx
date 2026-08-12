import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import { RouterProvider } from 'react-router-dom';
import './index.css';
import { router } from './router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Aplica prefers-reduced-motion a TODAS las animaciones de Framer
        Motion del sitio (sección 10.6) en un solo lugar, en vez de repetir
        useReducedMotion() en cada componente — una auditoría encontró que
        5 de 6 componentes con Framer Motion no lo verificaban. */}
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  </StrictMode>,
);
