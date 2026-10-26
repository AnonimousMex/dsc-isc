/** Keep each API process below the session pooler's connection allowance. */
export function prismaDatasourceUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('DATABASE_URL no tiene un formato válido.');
  }
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) return value;
  if (!url.searchParams.has('connection_limit')) url.searchParams.set('connection_limit', '3');
  if (!url.searchParams.has('pool_timeout')) url.searchParams.set('pool_timeout', '10');
  return url.toString();
}

export function isDatabaseConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const details = error as Error & { code?: string; errorCode?: string };
  const code = details.code ?? details.errorCode;
  return (
    Boolean(code && ['P1001', 'P1002', 'P1008', 'P1017', 'P2024'].includes(code)) ||
    /EMAXCONNSESSION|Can't reach database server|Server has closed the connection/i.test(
      error.message,
    )
  );
}

/** One retry for a read only; never replay a password check, update or token issuance. */
export async function retryDatabaseRead<T>(read: () => Promise<T>): Promise<T> {
  try {
    return await read();
  } catch (error) {
    if (!isDatabaseConnectionError(error)) throw error;
    await new Promise((resolve) => setTimeout(resolve, 150));
    return read();
  }
}
