import { appRouter, createFetchContext } from '@/server/lexai-trpc';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { NextRequest, NextResponse } from 'next/server';
import { getServerApiUrl, useInlineTrpc } from '@/lib/api-config';
import { looksLikeJsonResponse, safeJsonParse } from '@/lib/safe-json';
import { buildTrpcBatchError, buildTrpcErrorFromRawBody } from '@/lib/trpc-errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TIMEOUT_MS = 20_000;

async function proxyTrpc(request: NextRequest, segments: string[]): Promise<NextResponse> {
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

    const errorBody = buildTrpcErrorFromRawBody(text, upstream.status >= 400 ? upstream.status : 502);
    return new NextResponse(errorBody, {
      status: upstream.status >= 400 ? upstream.status : 502,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new NextResponse(
      buildTrpcBatchError('Could not connect to the API. Ensure the backend is running.', 503),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

function handleInlineTrpc(request: NextRequest) {
  const options = {
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: createFetchContext,
  };

  if (process.env['NODE_ENV'] === 'development') {
    return fetchRequestHandler({
      ...options,
      onError({ path, error }) {
        console.error(`[tRPC] ${path}:`, error.message);
      },
    });
  }

  return fetchRequestHandler(options);
}

async function dispatch(request: NextRequest, segments: string[]) {
  if (useInlineTrpc()) {
    return handleInlineTrpc(request);
  }

  const apiUrl = getServerApiUrl();
  if (!apiUrl || apiUrl.includes('localhost')) {
    return new NextResponse(
      buildTrpcBatchError(
        'Database is not configured. Connect Neon Postgres in Vercel or set API_URL.',
        503,
      ),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }

  return proxyTrpc(request, segments);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return dispatch(request, path);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return dispatch(request, path);
}