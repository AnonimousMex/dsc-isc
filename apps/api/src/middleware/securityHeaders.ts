import helmet from 'helmet';

/**
 * Cabeceras de seguridad de la API (sección 9). Nota: `apps/web`/`apps/admin`
 * son SPAs estáticas servidas por su propio hosting — su CSP se configura
 * en el hosting de despliegue (ver README, sección de despliegue), no aquí.
 * Esta CSP protege sobre todo las respuestas JSON y los archivos estáticos
 * servidos en /uploads (por ejemplo, si alguien lograra subir un HTML
 * disfrazado de imagen, esta cabecera evita que se interprete como página).
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      // Permite embeber video de YouTube desde los perfiles de docentes.
      frameSrc: ["'self'", 'https://www.youtube.com', 'https://www.youtube-nocookie.com'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      // La API en sí no sirve páginas para embeber — nadie debe poder
      // enmarcarla (distinto de frameSrc, que es lo que ESTA API embebe).
      frameAncestors: ["'none'"],
    },
  },
  frameguard: { action: 'deny' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});
