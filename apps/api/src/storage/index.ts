import { LocalDiskStorageAdapter } from './LocalDiskStorageAdapter.js';
import { S3StorageAdapter } from './S3StorageAdapter.js';
import type { StorageAdapter } from './StorageAdapter.js';

/**
 * Único punto donde se decide qué implementación concreta de
 * StorageAdapter se usa. El resto de la API (rutas/servicios/controladores)
 * importa siempre `storage` desde aquí y nunca las clases concretas —
 * cambiar STORAGE_DRIVER=local a STORAGE_DRIVER=s3 en .env es todo lo que
 * hace falta para migrar de disco local a un bucket S3-compatible.
 */
function createStorageAdapter(): StorageAdapter {
  const driver = process.env.STORAGE_DRIVER ?? 'local';
  if (driver === 's3') {
    return new S3StorageAdapter();
  }
  return new LocalDiskStorageAdapter();
}

export const storage: StorageAdapter = createStorageAdapter();
export type { StorageAdapter, SaveFileMeta, SaveFileResult, StorageFolder } from './StorageAdapter.js';
