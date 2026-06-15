import { NextRequest, NextResponse } from 'next/server';
import { getServerApiUrl, isApiConfigured } from '@/lib/api-config';
import { buildTrpcBatchError, buildTrpcErrorFromRawBody } from '@/lib/trpc-errors';
import { looksLikeJsonResponse, safeJsonParse } from '@/lib/safe-json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TIMEOUT_MS = 20_000;

async function proxyTrpc(request: NextRequest, segments: string[]): Promise<NextResponse> {
  if (!isApiConfigured()) {
    return new NextResponse(
      buildTrpcBatchError(
        'La API no está configurada en este entorno. Configure API_URL en Vercel.',
        503,
      ),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const path = segments.join('/');
  const apiUrl = getServerApiUrl();
  const target = `${apiUrl}/trpc/${path}${request.nextUrl.search}`;

  try {
    const init: RequestInit = {
      method: request.method,
      headers: {
        'content-type': request.headers.get('content-type') ?? 'application/json',
        ...(request.headers.get('authorization')
          ? { authorization: request.headers.get('authorization')! }
          : {}),
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      init.body = await request.text();
    }

    const upstream = await fetch(target, init);
    const text = await upstream.text();
    const contentType = upstream.headers.get('content-type');

    if (looksLikeJsonResponse(contentType, text)) {
      const parsed = safeJsonParse<unknown>(text);
      if (parsed.ok) {
        return new NextResponse(text, {
          status: upstream.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (process.env['NODE_ENV'] === 'development') {
      console.error('[tRPC proxy] Non-JSON upstream response:', text.slice(0, 300));
    }

    const errorBody = buildTrpcErrorFromRawBody(text, upstream.status >= 400 ? upstream.status : 502);
    return new NextResponse(errorBody, {
      status: upstream.status >= 400 ? upstream.status : 502,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'TimeoutError'
        ? 'La API tardó demasiado en responder.'
        : 'No se pudo conectar con la API. Compruebe que el backend esté en ejecución.';

    if (process.env['NODE_ENV'] === 'development') {
      console.error('[tRPC proxy] Fetch failed:', error);
    }

    return new NextResponse(buildTrpcBatchError(message, 503), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxyTrpc(request, path);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxyTrpc(request, path);
}