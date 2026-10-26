import type { Config } from 'tailwindcss';

/**
 * Preset de Tailwind compartido entre apps/web y apps/admin. Sistema
 * oscuro "black-box stage" (referencia: MasterClass), con el magenta de
 * la referencia sustituido por azul: lienzo casi negro, tipografía blanca
 * editorial, tarjetas que casi no se notan (un paso de superficie arriba
 * del lienzo, anillo interno en vez de sombra), y un solo azul vívido
 * para la acción principal — relleno, no contorno. El dorado queda para
 * pastillas de categoría/filtro, nunca para la acción principal.
 *
 * `primary`/`accent`/`signal`/`deep` apuntan a variables CSS (ver
 * `--color-*`) en vez de hex fijos: así el panel "Apariencia" del admin
 * (packages/shared/src/theme.ts) puede cambiar la marca en caliente, sin
 * deploy. Los hex de abajo son solo el valor por defecto.
 */
const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // Acción principal — SIEMPRE relleno (blue-600), nunca contorno.
        primary: 'rgb(var(--color-primary, 37 99 235) / <alpha-value>)',
        // Variante oscura para hover del relleno.
        accent: 'rgb(var(--color-accent, 29 78 216) / <alpha-value>)',
        // Dorado editorial — pastillas de categoría/filtro, nunca la acción principal.
        signal: 'rgb(var(--color-signal, 238 211 127) / <alpha-value>)',
        // Texto principal — blanco puro, el "ink" del escenario oscuro.
        ink: '#ffffff',
        // Texto muted/ayuda.
        muted: '#9ea0a9',
        // Tarjetas — un paso de superficie arriba del lienzo.
        surface: '#272c33',
        // Lienzo de página.
        elevated: '#222326',
        // Bordes — blanco hueso; se usa con opacidad (`ring-line/20`).
        line: 'rgb(244 244 245 / <alpha-value>)',
        // Paneles elevados: barras fijas, modales, footer.
        deep: 'rgb(var(--color-deep, 13 13 14) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // Titulares editoriales condensados — sustituto de Söhne Schmal.
        display: ['"Inter Tight"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      transitionTimingFunction: {
        signature: 'cubic-bezier(.22,.61,.36,1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-in-out',
      },
    },
  },
};

export default preset;
