'use client';

import type { AppRouter } from '@lexai/api/trpc';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';
import { getAuthToken } from './auth-storage';
import { buildTrpcBatchError } from './trpc-errors';
import { looksLikeJsonResponse, mapPlainTextApiError, safeJsonParse } from './safe-json';

export const trpc = createTRPCReact<AppRouter>();

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') return '';
  return process.env['WEB_URL'] ?? 'http://localhost:3000';
}

/**
 * Wraps fetch so tRPC never receives raw plain-text deploy errors.
 * Non-JSON bodies are converted to a valid tRPC batch error payload.
 */
/** Mirrors @trpc/client internals — not exported from the package. */
type RequestInitEsque = {
  body?: FormData | string | null | Uint8Array<ArrayBuffer> | Blob | File;
  headers?: [string, string][] | Record<string, string>;
  method?: string;
  signal?: AbortSignal | undefined;
};

type TrpcFetch = (
  input: RequestInfo | URL | string,
  init?: RequestInit | RequestInitEsque,
) => Promise<Response>;

export const safeTrpcFetch: TrpcFetch = async (input, init) => {
  const response = await fetch(input, init as RequestInit | undefined);
  const text = await response.clone().text();
  const contentType = response.headers.get('content-type');

  if (looksLikeJsonResponse(contentType, text)) {
    const parsed = safeJsonParse(text);
    if (parsed.ok) return response;
  }

  const message = mapPlainTextApiError(text);
  if (process.env['NODE_ENV'] === 'development') {
    console.error('[tRPC] Non-JSON response:', text.slice(0, 200));
  }

  return new Response(buildTrpcBatchError(message, response.status >= 400 ? response.status : 502), {
    status: response.status >= 400 ? response.status : 502,
    headers: { 'Content-Type': 'application/json' },
  });
};

export function createTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
        fetch: safeTrpcFetch,
        headers() {
          const token = getAuthToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}

/** User-facing message from tRPC / network errors. */
export function formatTrpcError(message: string): string {
  if (message.includes('not valid JSON') || message.includes('Unexpected token')) {
    return 'El servidor devolvió una respuesta inesperada. La API puede no estar disponible.';
  }
  return message;
}