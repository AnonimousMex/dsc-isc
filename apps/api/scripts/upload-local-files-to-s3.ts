import 'dotenv/config';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

/**
 * Script de un solo uso para migrar a Supabase Storage (ver README.md).
 * Sube cada archivo de apps/api/storage/uploads/ al bucket S3 configurado
 * en .env, usando la MISMA ruta relativa como key (ej. "images/abc.jpg")
 * — así los MediaAsset.path que ya están en la base de datos (locales o
 * recién restaurados con import-data.ts) siguen apuntando al lugar
 * correcto sin tocar ninguna fila.
 *
 * Requiere STORAGE_DRIVER=s3 y las variables S3_* ya configuradas en .env
 * (apuntando al bucket de Supabase). Es seguro borrar este archivo después
 * de confirmar la migración.
 */
const EXTENSION_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
};

const UPLOADS_ROOT = path.resolve(process.cwd(), 'storage', 'uploads');

async function listFilesRecursive(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursive(fullPath)));
    } else if (entry.name !== '.gitkeep') {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  const bucket = process.env.S3_BUCKET;
  const region = process.env.S3_REGION;
  if (!bucket || !region) {
    throw new Error('Faltan S3_BUCKET/S3_REGION en .env — configura el driver s3 antes de correr esto.');
  }

  const client = new S3Client({
    region,
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: true,
    credentials:
      process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
          }
        : undefined,
  });

  const files = await listFilesRecursive(UPLOADS_ROOT);
  console.log(`Encontrados ${files.length} archivos en ${UPLOADS_ROOT}`);

  for (const filePath of files) {
    const key = path.posix.join(...path.relative(UPLOADS_ROOT, filePath).split(path.sep));
    const body = await readFile(filePath);
    const contentType = EXTENSION_TO_MIME[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream';

    await client.send(
      new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }),
    );
    console.log(`Subido: ${key}`);
  }

  console.log('Listo.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
