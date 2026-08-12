export type StorageFolder = 'images' | 'videos' | 'documents';

export interface SaveFileMeta {
  originalName: string;
  mimeType: string;
  folder: StorageFolder;
}

export interface SaveFileResult {
  /** Ruta relativa estable, se guarda en MediaAsset.path. */
  path: string;
  /** URL absoluta/servible para consumir el archivo desde el navegador. */
  url: string;
}

/**
 * Contrato único que el resto de la API conoce. Nunca importar
 * LocalDiskStorageAdapter/S3StorageAdapter directamente fuera de
 * storage/index.ts — así cambiar STORAGE_DRIVER en .env es suficiente
 * para migrar de disco local a un bucket S3-compatible sin tocar
 * controladores ni servicios.
 */
export interface StorageAdapter {
  save(file: Buffer, meta: SaveFileMeta): Promise<SaveFileResult>;
  delete(path: string): Promise<void>;
  getPublicUrl(path: string): string;
}
