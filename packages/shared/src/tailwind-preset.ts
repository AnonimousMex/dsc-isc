import type { Config } from 'tailwindcss';

/**
 * Preset de Tailwind compartido entre apps/web y apps/admin (sección 5 del
 * documento de producto). web usa la paleta completa (incluye `deep` para
 * los tramos cinematográficos); admin la reutiliza pero se apoya más en
 * `elevated`/`line` por ser una herramienta de trabajo, no una vitrina.
 *
 * Paleta verde/blanco/negro (alineada al logo de ISC): `primary`/`accent`
 * son un verde legible sobre blanco para botones y acciones; `signal` es el
 * verde lima del logo de ISC, reservado para acentos interactivos (nunca
 * como fondo grande); `deep` pasa de azul marino a un verde casi negro para
 * los tramos cinematográficos.
 */
const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        primary: '#1F7A3D',
        accent: '#14532D',
        signal: '#8DC63F',
        ink: '#121212',
        muted: '#5C5F5A',
        surface: '#FFFFFF',
        elevated: '#F4F6F2',
        line: '#E0E4DC',
        deep: '#0B1F13',
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
