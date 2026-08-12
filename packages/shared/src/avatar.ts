/**
 * Fallback de avatar por iniciales (sección 6.5, Regla 2): cuando un
 * docente no tiene foto, se muestra un círculo con sus iniciales y un
 * color de fondo determinado por un hash simple del nombre. Vive en
 * packages/shared para que el color sea idéntico entre apps/web y
 * apps/admin — nunca depende de una imagen externa.
 *
 * Cada color se eligió para dar al menos 4.5:1 de contraste contra texto
 * blanco (AA para texto normal, no solo el 3:1 de texto grande) — una
 * auditoría Lighthouse real detectó que el tono "signal" de la marca
 * (#3FB8D6, pensado para acentos puntuales, no para fondos de texto) solo
 * daba 2.3:1 y se reemplazó aquí por una variante más oscura de la misma
 * familia de color.
 */
const PALETTE = ['#2661A7', '#1E4E86', '#1D7A94', '#0F2A47', '#3E6488', '#2E7D9E'];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function avatarColorFor(name: string): string {
  return PALETTE[hashString(name) % PALETTE.length] ?? PALETTE[0]!;
}

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return (first + last).toUpperCase();
}
