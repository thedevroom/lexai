/** Server-side API base URL (Fastify) for proxy mode. */
export function getServerApiUrl(): string {
  return process.env['API_URL'] ?? 'http://localhost:4000';
}

function hasCloudDatabase(): boolean {
  const url = process.env['DATABASE_URL'] ?? process.env['POSTGRES_PRISMA_URL'] ?? '';
  return Boolean(url && !url.includes('localhost'));
}

/** Run tRPC inside Next.js (Vercel serverless) when a cloud database is available. */
export function useInlineTrpc(): boolean {
  return hasCloudDatabase();
}

/** Public hint for UI when API is misconfigured in production. */
export function isApiConfigured(): boolean {
  if (useInlineTrpc()) return true;
  const url = process.env['API_URL'] ?? '';
  if (!url || url.includes('localhost')) return process.env['NODE_ENV'] !== 'production';
  return !url.includes('placeholder');
}