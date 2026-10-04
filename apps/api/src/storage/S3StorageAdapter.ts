import { randomUUID } from 'node:crypto';
import path from 'node:path';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { SaveFileMeta, SaveFileResult, StorageAdapter } from './StorageAdapter.js';

/**
 * Implementación lista pero inactiva por defecto (se activa con
 * STORAGE_DRIVER=s3 en .env). Compatible con cualquier proveedor que hable
 * el protocolo S3 (AWS S3, Cloudflare R2, Backblaze B2) vía S3_ENDPOINT.
 * Ver README.md → "Migrar a Postgres/S3".
 */
export class S3StorageAdapter implements StorageAdapter {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor() {
    const bucket = process.env.S3_BUCKET;
    const region = process.env.S3_REGION;
    const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;
    if (!bucket || !region || !publicBaseUrl) {
      throw new Error(
        'S3StorageAdapter requiere S3_BUCKET, S3_REGION y S3_PUBLIC_BASE_URL en .env',
      );
    }
    this.bucket = bucket;
    this.publicBaseUrl = publicBaseUrl.replace(/\/$/, '');
    this.client = new S3Client({
      region,
      endpoint: process.env.S3_ENDPOINT || undefined,
      // Requerido por proveedores S3-compatibles que no son AWS (Supabase
      // Storage, Cloudflare R2, Backblaze B2): no soportan el direccionamiento
      // "virtual-hosted-style" (bucket.endpoint.com) que el SDK usa por
      // defecto, solo "path-style" (endpoint.com/bucket/...).
      forcePathStyle: true,
      credentials:
        process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.S3_ACCESS_KEY_ID,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            }
          : undefined,
    });
  }

  async save(file: Buffer, meta: SaveFileMeta): Promise<SaveFileResult> {
    const extension = path.extname(meta.originalName) ?? '';
    const key = path.posix.join(meta.folder, `${randomUUID()}${extension}`);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: meta.mimeType,
      }),
    );

    return { path: key, url: this.getPublicUrl(key) };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  getPublicUrl(key: string): string {
    return `${this.publicBaseUrl}/${key}`;
  }
}
