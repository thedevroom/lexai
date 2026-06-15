import type { User } from '@prisma/client';
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

export async function createContext({
  req,
}: CreateFastifyContextOptions): Promise<TrpcContext> {
  const token = extractBearerToken(req.headers.authorization);
  let user: User | null = null;

  if (token) {
    const payload = await verifyAuthToken(token);
    if (payload) {
      user = await prisma.user.findUnique({ where: { id: payload.sub, isActive: true } });
    }
  }

  return {
    prisma,
    user,
    meta: {
      ip: (req.headers['x-forwarded-for'] as string | undefined) ?? req.ip,
      userAgent: (req.headers['user-agent']) ?? null,
    },
  };
}