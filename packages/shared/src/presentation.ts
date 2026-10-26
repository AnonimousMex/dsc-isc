import { z } from 'zod';
import type { SiteConfig } from './types/index.js';

export const PRESENTATION_KEY = 'site.presentation';
export const chapterEffectSchema = z.enum([
  'history',
  'systems',
  'faculty',
  'community',
  'specialties',
  'news',
  'resources',
  'graduates',
  'chip',
  'none',
]);
const text = (value: string, max = 500) =>
  z.string().trim().min(1, 'Escribe un texto antes de guardar.').max(max).default(value);
const hex = (value: string) =>
  z
    .string()
    .regex(/^#[0-9a-f]{6}$/i, 'Usa un color hexadecimal, por ejemplo #79b5ff.')
    .default(value);
export const presentationSchema = z.object({
  home: z
    .object({
      title: text('El futuro no\nse espera.', 120),
      highlight: text('Se transforma.', 70),
      description: text(
        'Integra software, hardware, redes y datos para comprender sistemas y resolver problemas reales. Descubre Ingeniería en Sistemas Computacionales.',
      ),
      button: text('Explora la carrera', 60),
      footerTitle: text('Conocimiento que conecta.\nSoluciones que transforman.', 150),
      autoplay: z.boolean().default(true),
      interval: z.number().int().min(3).max(30).default(7),
      showArtwork: z.boolean().default(true),
    })
    .default({}),
  colors: z
    .object({
      primary: hex('#c2dfff'),
      accent: hex('#d9ecff'),
      signal: hex('#99e2ff'),
      deep: hex('#0b1220'),
    })
    .default({}),
  motion: z
    .object({
      enabled: z.boolean().default(true),
      background: z.boolean().default(true),
      interactive: z.boolean().default(true),
      logos: z.boolean().default(true),
      reveal: z.boolean().default(true),
      intensity: z.enum(['soft', 'normal', 'vivid']).default('normal'),
    })
    .default({}),
  timeline: z
    .object({
      autoplay: z.boolean().default(true),
      interval: z.number().int().min(3).max(30).default(7),
    })
    .default({}),
  chapters: z
    .object({
      nosotros: chapterEffectSchema.default('history'),
      carrera: chapterEffectSchema.default('systems'),
      docentes: chapterEffectSchema.default('faculty'),
      laboratorios: chapterEffectSchema.default('chip'),
      comunidad: chapterEffectSchema.default('community'),
      especialidades: chapterEffectSchema.default('specialties'),
      noticias: chapterEffectSchema.default('news'),
      normateca: chapterEffectSchema.default('resources'),
      egresados: chapterEffectSchema.default('graduates'),
    })
    .default({}),
});
export type PresentationSettings = z.infer<typeof presentationSchema>;
export const DEFAULT_PRESENTATION = presentationSchema.parse({});
export function readPresentation(config: SiteConfig[]): PresentationSettings {
  const saved = config.find((item) => item.key === PRESENTATION_KEY)?.value;
  const parsed = presentationSchema.safeParse(saved ?? {});
  const result = parsed.success ? parsed.data : presentationSchema.parse({});
  if (saved === undefined)
    for (const key of ['primary', 'accent', 'signal', 'deep'] as const) {
      const legacy = config.find((item) => item.key === `theme.${key}`)?.value;
      if (typeof legacy === 'string' && /^#[0-9a-f]{6}$/i.test(legacy)) result.colors[key] = legacy;
    }
  // Update only the former built-in colors; preserve custom selections.
  const previousDefaults = {
    primary: ['#c9f36b', '#79b5ff', '#add4ff'],
    accent: ['#e1ff9c', '#acd2ff'],
    signal: ['#99ff40', '#58d5ff'],
    deep: ['#0d0d0e'],
  };
  for (const key of ['primary', 'accent', 'signal', 'deep'] as const) {
    if (previousDefaults[key].includes(result.colors[key].toLowerCase()))
      result.colors[key] = DEFAULT_PRESENTATION.colors[key];
  }
  return result;
}
function channels(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function luminance(hex: string): number {
  const linear = (value: number) => {
    const n = value / 255;
    return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = channels(hex);
  return linear(r) * 0.2126 + linear(g) * 0.7152 + linear(b) * 0.0722;
}
export function colorContrast(first: string, second: string): number {
  const a = luminance(first),
    b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
function blend(hex: string, towards: number, amount: number): string {
  return (
    '#' +
    channels(hex)
      .map((value) =>
        Math.round(value + (towards - value) * amount)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}
export function readableTextColor(background: string): string {
  return colorContrast('#ffffff', background) > colorContrast('#111315', background)
    ? '#ffffff'
    : '#111315';
}
function lightBlue(hex: string, minLightness: number, referenceHue: number): string {
  const [r, g, b] = channels(hex).map((c) => c / 255) as [number, number, number];
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    delta = max - min;
  let hue = referenceHue;
  if (delta > 0) {
    const source =
      max === r
        ? 60 * (((g - b) / delta) % 6)
        : max === g
          ? 60 * ((b - r) / delta + 2)
          : 60 * ((r - g) / delta + 4);
    if (source >= 195 && source <= 220) hue = source;
  }
  const l = Math.max(minLightness, Math.min(0.96, (max + min) / 2));
  const chroma = 1 - Math.abs(2 * l - 1);
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1)),
    m = l - chroma / 2;
  const rgb = [0, x, chroma];
  return (
    '#' +
    rgb
      .map((v) =>
        Math.round((v + m) * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}
export function resolvePresentationColors(
  colors: PresentationSettings['colors'],
): PresentationSettings['colors'] {
  const result = { ...colors };
  for (let step = 1; colorContrast('#ffffff', result.deep) < 7 && step <= 20; step++)
    result.deep = blend(colors.deep, 0, step / 20);
  result.primary = lightBlue(colors.primary, 0.88, 210);
  result.accent = lightBlue(colors.accent, 0.925, 210);
  result.signal = lightBlue(colors.signal, 0.8, 200);
  return result;
}
export function applyPresentation(
  settings: PresentationSettings,
  root: HTMLElement = document.documentElement,
) {
  const colors = resolvePresentationColors(settings.colors);
  for (const [key, value] of Object.entries(colors)) {
    root.style.setProperty(`--site-${key}`, value);
    root.style.setProperty(`--color-${key}`, channels(value).join(' '));
  }
  root.style.setProperty('--site-button-ink', readableTextColor(colors.primary));
  root.style.setProperty('--site-hover-ink', readableTextColor(colors.accent));
}
