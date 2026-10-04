import type { Config } from 'tailwindcss';

/**
 * Preset de Tailwind compartido entre apps/web y apps/admin (sección 5 del
 * documento de producto). web usa la paleta completa (incluye `deep` para
 * los tramos cinematográficos); admin la reutiliza pero se apoya más en
 * `elevated`/`line` por ser una herramienta de trabajo, no una vitrina.
 *
 * Paleta azul/blanco/negro (alineada al azul institucional del sitio
 * oficial dsc.itmorelia.edu.mx): `primary`/`accent` son el azul del
 * footer oficial para botones y acciones; `signal` es un azul más claro,
 * reservado para acentos interactivos (nunca como fondo grande); `deep`
 * pasa de ese azul al azul marino casi negro de la franja inferior del
 * sitio oficial, para los tramos cinematográficos.
 *
 * `primary`/`accent`/`signal`/`deep` apuntan a variables CSS (ver
 * `--color-*` en index.css de cada app) en vez de hex fijos: así el panel
 * "Apariencia" del admin (packages/shared/src/theme.ts) puede cambiar la
 * marca en caliente, sin deploy. Los hex de abajo son solo el valor por
 * defecto que usa Tailwind para generar las clases — el color real en
 * pantalla lo decide la variable CSS en tiempo de ejecución.
 */
const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary, 42 83 148) / <alpha-value>)',
        accent: 'rgb(var(--color-accent, 22 58 114) / <alpha-value>)',
        signal: 'rgb(var(--color-signal, 90 169 230) / <alpha-value>)',
        ink: '#121212',
        muted: '#5C5F5A',
        surface: '#FFFFFF',
        elevated: '#F2F5F9',
        line: '#DCE3EC',
        deep: 'rgb(var(--color-deep, 11 26 51) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Open Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      transitionTimingFunction: {
        signature: 'cubic-bezier(.22,.61,.36,1)',
      },
    },
  },
};

export default preset;
