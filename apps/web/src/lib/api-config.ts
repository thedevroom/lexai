/** Server-side API base URL (Fastify). */
export function getServerApiUrl(): string {
  return process.env['API_URL'] ?? 'http://localhost:4000';
}

/** Public hint for UI when API is misconfigured in production. */
export function isApiConfigured(): boolean {
  const url = process.env['API_URL'] ?? '';
  if (!url || url.includes('localhost')) return process.env['NODE_ENV'] !== 'production';
  return !url.includes('placeholder');
}