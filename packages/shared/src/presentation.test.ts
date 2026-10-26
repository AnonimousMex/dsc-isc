import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PRESENTATION,
  PRESENTATION_KEY,
  presentationSchema,
  readPresentation,
  resolvePresentationColors,
  colorContrast,
  readableTextColor,
} from './presentation.js';

describe('Configuración pública del sitio', () => {
  it('conserva los valores por defecto al cargar una configuración parcial', () => {
    const settings = presentationSchema.parse({
      home: { title: 'Una nueva portada' },
      motion: { background: false },
    });
    expect(settings.home.title).toBe('Una nueva portada');
    expect(settings.home.interval).toBe(7);
    expect(settings.motion.background).toBe(false);
    expect(settings.chapters.nosotros).toBe('history');
  });
  it('rechaza colores, duraciones y figuras inválidas antes de publicar', () => {
    expect(presentationSchema.safeParse({ colors: { primary: 'red' } }).success).toBe(false);
    expect(presentationSchema.safeParse({ timeline: { interval: 0 } }).success).toBe(false);
    expect(presentationSchema.safeParse({ home: { interval: 60 } }).success).toBe(false);
    expect(presentationSchema.safeParse({ chapters: { docentes: 'invalid' } }).success).toBe(false);
  });
  it('recupera los colores guardados por el panel anterior sin perder el nuevo formato', () => {
    expect(
      readPresentation([{ key: 'theme.primary', value: '#123456', updatedAt: '' }]).colors.primary,
    ).toBe('#123456');
    expect(
      readPresentation([
        { key: PRESENTATION_KEY, value: { colors: { primary: '#abcdef' } }, updatedAt: '' },
        { key: 'theme.primary', value: '#123456', updatedAt: '' },
      ]).colors.primary,
    ).toBe('#abcdef');
  });
  it('usa valores seguros si el contenido persistido está corrupto', () => {
    expect(
      readPresentation([
        { key: PRESENTATION_KEY, value: { home: { interval: -2 } }, updatedAt: '' },
      ]),
    ).toEqual(DEFAULT_PRESENTATION);
  });
});

describe('Contraste de la paleta sobre fondos oscuros', () => {
  it('mantiene visibles los azules oscuros guardados por el panel', () => {
    const colors = resolvePresentationColors({
      primary: '#163a72',
      accent: '#10274a',
      signal: '#123456',
      deep: '#0b1220',
    });
    for (const key of ['primary', 'accent', 'signal'] as const)
      expect(colorContrast(colors[key], colors.deep)).toBeGreaterThanOrEqual(4.5);
    expect(colorContrast(colors.primary, readableTextColor(colors.primary))).toBeGreaterThanOrEqual(
      4.5,
    );
  });
  it('preserva los colores que ya tienen contraste suficiente', () => {
    expect(resolvePresentationColors(DEFAULT_PRESENTATION.colors)).toEqual(
      DEFAULT_PRESENTATION.colors,
    );
  });
  it('actualiza la antigua paleta verde predeterminada sin cambiar otros ajustes', () => {
    const settings = readPresentation([
      {
        key: PRESENTATION_KEY,
        value: {
          home: { title: 'Mi portada' },
          colors: { primary: '#c9f36b', accent: '#e1ff9c', signal: '#99ff40', deep: '#0d0d0e' },
        },
        updatedAt: '',
      },
    ]);
    expect(settings.colors).toEqual(DEFAULT_PRESENTATION.colors);
    expect(settings.home.title).toBe('Mi portada');
  });
  it('elige tinta legible para botones de intensidad media y mantiene el fondo oscuro', () => {
    const colors = resolvePresentationColors({
      primary: '#638cc4',
      accent: '#638cc4',
      signal: '#638cc4',
      deep: '#eeeeee',
    });
    expect(colorContrast(colors.primary, readableTextColor(colors.primary))).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(colorContrast('#ffffff', colors.deep)).toBeGreaterThanOrEqual(7);
  });
});

describe('Estados hover coherentes', () => {
  it('convierte un hover verde persistido en azul claro con tinta oscura legible', () => {
    const colors = resolvePresentationColors({
      primary: '#163a72',
      accent: '#c9f36b',
      signal: '#99ff40',
      deep: '#0b1220',
    });
    for (const key of ['primary', 'accent', 'signal'] as const) {
      const n = parseInt(colors[key].slice(1), 16);
      expect(n & 255).toBeGreaterThanOrEqual((n >> 8) & 255);
      expect(n & 255).toBeGreaterThan((n >> 16) & 255);
      expect(colorContrast(colors[key], '#111315')).toBeGreaterThanOrEqual(7);
    }
    expect(readableTextColor(colors.accent)).toBe('#111315');
    expect(readableTextColor(colors.primary)).toBe('#111315');
  });
});
