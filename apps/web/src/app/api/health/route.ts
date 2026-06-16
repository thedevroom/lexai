import { NextResponse } from 'next/server';
import { getServerApiUrl, isApiConfigured, useInlineTrpc } from '@/lib/api-config';
import { safeJsonParse } from '@/lib/safe-json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const web = {
    status: 'ok' as const,
    service: 'lexai-web',
    apiConfigured: isApiConfigured(),
    mode: useInlineTrpc() ? ('inline' as const) : ('proxy' as const),
  };

  if (useInlineTrpc()) {
    return NextResponse.json({
      ...web,
      api: { status: 'ok' as const, mode: 'inline-trpc' },
    });
  }

  if (!isApiConfigured()) {
    return NextResponse.json({
      ...web,
      api: { status: 'unconfigured' as const },
    });
  }

  try {
    const res = await fetch(`${getServerApiUrl()}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    const text = await res.text();
    const parsed = safeJsonParse<{ status?: string }>(text);

    if (parsed.ok && res.ok) {
      return NextResponse.json({
        ...web,
        api: { status: 'ok' as const, upstream: parsed.data },
      });
    }

    return NextResponse.json({
      ...web,
      api: {
        status: 'degraded' as const,
        httpStatus: res.status,
        message: parsed.ok ? undefined : parsed.message,
      },
    });
  } catch {
    return NextResponse.json({
      ...web,
      api: { status: 'unreachable' as const },
    });
  }
}