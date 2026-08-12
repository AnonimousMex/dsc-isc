import type { Config } from 'tailwindcss';

/**
 * Preset de Tailwind compartido entre apps/web y apps/admin (sección 5 del
 * documento de producto). web usa la paleta completa (incluye `deep` para
 * los tramos cinematográficos); admin la reutiliza pero se apoya más en
 * `elevated`/`line` por ser una herramienta de trabajo, no una vitrina.
 */
const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        primary: '#2661A7',
        accent: '#1E4E86',
        signal: '#3FB8D6',
        ink: '#1C1C1B',
        muted: '#666666',
        surface: '#FFFFFF',
        elevated: '#F5F7FA',
        line: '#E1E6EC',
        deep: '#0F2A47',
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
