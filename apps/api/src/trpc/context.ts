import type { User } from '@prisma/client';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { prisma } from '../lib/prisma.js';
import { extractBearerToken, verifyAuthToken } from '../lib/auth.js';

export interface RequestMeta {
  ip: string | null;
  userAgent: string | null;
}

export interface TrpcContext {
  prisma: typeof prisma;
  user: User | null;
  meta: RequestMeta;
}

async function buildTrpcContext(
  authorization: string | null | undefined,
  meta: RequestMeta,
): Promise<TrpcContext> {
  const token = extractBearerToken(authorization ?? undefined);
  let user: User | null = null;

  if (token) {
    const payload = await verifyAuthToken(token);
    if (payload) {
      user = await prisma.user.findUnique({ where: { id: payload.sub, isActive: true } });
    }
  }

  return { prisma, user, meta };
}

export async function createContext({
  req,
}: CreateFastifyContextOptions): Promise<TrpcContext> {
  return buildTrpcContext(req.headers.authorization, {
    ip: (req.headers['x-forwarded-for'] as string | undefined) ?? req.ip,
    userAgent: req.headers['user-agent'] ?? null,
  });
}

export async function createFetchContext({
  req,
}: FetchCreateContextFnOptions): Promise<TrpcContext> {
  return buildTrpcContext(req.headers.get('authorization') ?? undefined, {
    ip: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip'),
    userAgent: req.headers.get('user-agent'),
  });
}