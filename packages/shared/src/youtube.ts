/**
 * Normaliza cualquier URL de YouTube aceptada por `youtubeEmbedUrlSchema`
 * (watch?v=, /shorts/, /v/, o ya /embed/) a la forma /embed/<id>, la única
 * que YouTube permite enmarcar dentro de un <iframe> de otro origen — una
 * URL de /watch (la que se copia normalmente desde el navegador) responde
 * con cabeceras que bloquean el framing y el iframe muestra "rechazó la
 * conexión". El esquema Zod solo valida el dominio, no la ruta, así que
 * esta conversión debe pasar siempre antes de usar la URL como `src`.
 * Si no reconoce el formato, devuelve la URL tal cual (nunca lanza).
 */
export function toYoutubeEmbedUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (parsed.pathname.startsWith('/embed/')) {
    return url;
  }

  const id =
    parsed.searchParams.get('v') ?? parsed.pathname.match(/^\/(?:shorts|v)\/([^/?]+)/)?.[1];
  if (!id) {
    return url;
  }

  parsed.pathname = `/embed/${id}`;
  parsed.search = '';
  return parsed.toString();
}
