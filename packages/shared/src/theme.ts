import type { SiteConfig } from './types/index';

/**
 * Los 4 colores de marca (sección "Apariencia" del admin) se guardan en
 * site-config como hex planos, bajo estas claves, y se aplican en caliente
 * sobre las variables CSS que el preset de Tailwind referencia (ver
 * tailwind-preset.ts) — así un cambio de color no requiere un deploy.
 * `ink`/`muted`/`surface`/`elevated`/`line` quedan fuera a propósito: son
 * neutrales que garantizan contraste de texto legible, no "marca".
 */
export const THEME_COLOR_KEYS = {
  primary: 'theme.primary',
  accent: 'theme.accent',
  signal: 'theme.signal',
  deep: 'theme.deep',
} as const;

const CSS_VAR_BY_THEME_KEY: Record<string, string> = {
  [THEME_COLOR_KEYS.primary]: '--color-primary',
  [THEME_COLOR_KEYS.accent]: '--color-accent',
  [THEME_COLOR_KEYS.signal]: '--color-signal',
  [THEME_COLOR_KEYS.deep]: '--color-deep',
};

export function hexToRgbTriplet(hex: string): string | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  const hexDigits = match?.[1];
  if (!hexDigits) return null;
  const int = parseInt(hexDigits, 16);
  return `${(int >> 16) & 255} ${(int >> 8) & 255} ${int & 255}`;
}

/** Aplica los colores guardados en site-config como variables CSS sobre <html>. */
export function applyThemeFromConfig(config: SiteConfig[], root: HTMLElement = document.documentElement): void {
  for (const [key, cssVar] of Object.entries(CSS_VAR_BY_THEME_KEY)) {
    const value = config.find((c) => c.key === key)?.value;
    if (typeof value !== 'string') continue;
    const rgb = hexToRgbTriplet(value);
    if (rgb) root.style.setProperty(cssVar, rgb);
  }
}
