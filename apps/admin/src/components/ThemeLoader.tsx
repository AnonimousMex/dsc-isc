import { useEffect } from 'react';
import { applyThemeFromConfig, type SiteConfig } from '@dsc-isc/shared';
import { apiGet } from '../lib/apiClient';

/**
 * Sin salida visual: al montar, trae site-config y aplica los colores de
 * marca (sección "Apariencia" de Configuración) como variables CSS — el
 * admin refleja la misma marca que el sitio público, incluso antes de
 * iniciar sesión (la lista de site-config es pública, sin auth).
 */
export default function ThemeLoader() {
  useEffect(() => {
    apiGet<SiteConfig[]>('/site-config')
      .then(applyThemeFromConfig)
      .catch(() => {
        // Sin conexión a la API: se queda con los colores por defecto del preset.
      });
  }, []);

  return null;
}
