import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../lib/env.js';
import type { SaveFileMeta, SaveFileResult, StorageAdapter } from './StorageAdapter.js';

const UPLOADS_ROOT = path.resolve(process.cwd(), 'storage', 'uploads');

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'application/pdf': '.pdf',
};

/**
 * Implementación activa por defecto (STORAGE_DRIVER=local). Guarda el
 * binario dentro de apps/api/storage/uploads/<folder>/ con un nombre
 * generado por el servidor (nunca el nombre que manda el navegador) y
 * sirve la URL pública vía express.static montado en /uploads
 * (ver src/server.ts).
 */
export class LocalDiskStorageAdapter implements StorageAdapter {
  async save(file: Buffer, meta: SaveFileMeta): Promise<SaveFileResult> {
    const extension = EXTENSION_BY_MIME[meta.mimeType] ?? path.extname(meta.originalName) ?? '';
    const fileName = `${randomUUID()}${extension}`;
    const folderPath = path.join(UPLOADS_ROOT, meta.folder);
    await mkdir(folderPath, { recursive: true });

    const absolutePath = path.join(folderPath, fileName);
    await writeFile(absolutePath, file, { mode: 0o644 });

    const relativePath = path.posix.join(meta.folder, fileName);
    return { path: relativePath, url: this.getPublicUrl(relativePath) };
  }

  async delete(relativePath: string): Promise<void> {
    const absolutePath = path.join(UPLOADS_ROOT, relativePath);
    if (!absolutePath.startsWith(UPLOADS_ROOT)) {
      throw new Error('Ruta de archivo fuera de storage/uploads');
    }
    await unlink(absolutePath).catch(() => undefined);
  }

  getPublicUrl(relativePath: string): string {
    // Debe ser absoluta (contrato de StorageAdapter): apps/web y apps/admin
    // corren en otro origen que la API, así que una ruta relativa como
    // "/uploads/..." se resolvería contra el origen equivocado (el del SPA,
    // no el de la API) y el navegador nunca encontraría el archivo.
    return `${env.apiPublicUrl}/uploads/${relativePath}`;
  }
}
