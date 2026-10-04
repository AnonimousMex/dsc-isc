import { useEffect } from 'react';
import { applyThemeFromConfig } from '@dsc-isc/shared';
import { api } from '../../lib/apiClient';

/**
 * Sin salida visual: al montar, trae site-config y aplica los colores de
 * marca guardados ahí (panel "Apariencia" del admin) como variables CSS —
 * así un cambio de color se refleja sin tocar código ni redesplegar. Antes
 * de que termine la consulta, se ve el valor por defecto del preset de
 * Tailwind (ver tailwind-preset.ts), nunca una página sin estilo.
 */
export default function ThemeLoader() {
  useEffect(() => {
    api
      .siteConfig()
      .then(applyThemeFromConfig)
      .catch(() => {
        // Sin conexión a la API: se queda con los colores por defecto del preset.
      });
  }, []);

  return null;
}
