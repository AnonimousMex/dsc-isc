import multer from 'multer';

// Límite global generoso (el límite real por tipo se aplica después de
// detectar el MIME real del binario, ver services/mediaService.ts) —
// multer necesita un límite antes de saber de qué tipo es el archivo.
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100MB (tope de video)

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
});
