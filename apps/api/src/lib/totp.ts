import { generateSecret, generateURI, verify } from 'otplib';

export function generateTotpSecret(): string {
  return generateSecret();
}

export function getTotpProvisioningUri(email: string, secret: string): string {
  return generateURI({ issuer: 'DSC ISC', label: email, secret });
}

export async function verifyTotpCode(secret: string, code: string): Promise<boolean> {
  // epochTolerance está en SEGUNDOS (no en "pasos" de 30s) — con 1 casi no
  // había margen real, lo que rechazaba códigos válidos con cualquier
  // demora humana normal al escribirlos. 90s cubre un paso completo de
  // holgura en cada dirección.
  const result = await verify({ secret, token: code, epochTolerance: 90 });
  return result.valid;
}
