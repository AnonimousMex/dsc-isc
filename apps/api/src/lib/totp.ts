import { generateSecret, generateURI, verify } from 'otplib';

export function generateTotpSecret(): string {
  return generateSecret();
}

export function getTotpProvisioningUri(email: string, secret: string): string {
  return generateURI({ issuer: 'DSC ISC', label: email, secret });
}

export async function verifyTotpCode(secret: string, code: string): Promise<boolean> {
  const result = await verify({ secret, token: code, epochTolerance: 1 });
  return result.valid;
}
