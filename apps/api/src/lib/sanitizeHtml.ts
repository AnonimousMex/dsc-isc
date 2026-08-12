import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const window = new JSDOM('').window;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const purify = DOMPurify(window as any);

/**
 * Sanea el HTML que produce el editor Tiptap del admin antes de guardarlo.
 * Nunca se confía en el HTML que llega del navegador, ni siquiera de un
 * admin autenticado (sección 9) — por eso esto corre en el servidor, no
 * solo en el cliente.
 */
export function sanitizeRichText(html: string): string {
  return purify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
      'h2', 'h3', 'h4', 'blockquote', 'code', 'pre', 'img',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt'],
  });
}
