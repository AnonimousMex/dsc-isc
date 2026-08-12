/**
 * Ajusta el ancho solicitado a un proveedor externo de imágenes (Unsplash,
 * Picsum) según el tamaño real en el que se va a mostrar — evita pedir una
 * imagen de 1200px+ para una miniatura de 340px (hallazgo real de la
 * auditoría Lighthouse en la Fase 13: una miniatura pesaba 104KB cuando
 * con el ancho correcto pesa una fracción de eso). Los archivos subidos al
 * propio servidor (rutas `/uploads/...`) no se pueden re-escalar así —
 * se devuelven sin cambios; el admin debe subir un archivo de tamaño
 * razonable para ese caso (no hay pipeline de imágenes en este proyecto).
 */
export function resizeImageUrl(url: string, width: number): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'images.unsplash.com') {
      parsed.searchParams.set('w', String(width));
      return parsed.toString();
    }
    if (parsed.hostname === 'picsum.photos') {
      // picsum codifica el tamaño en la ruta (/id/<id>/<w>/<h>), no en query params.
      return url;
    }
    return url;
  } catch {
    return url;
  }
}
