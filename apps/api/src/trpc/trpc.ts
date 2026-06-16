import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { checkRateLimit } from '../middleware/rate-limit.js';
import { throwRateLimited } from './errors.js';
import type { TrpcContext } from './context.js';

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        lexaiCode: error.code,
      },
    };
  },
});

export const createRouter = t.router;
export const publicProcedure = t.procedure;

const loggingMiddleware = t.middleware(async ({ path, type, next, ctx }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;

  if (process.env['NODE_ENV'] === 'development') {
    console.info(
      JSON.stringify({
        level: result.ok ? 'info' : 'error',
        trpc: { path, type, durationMs, userId: ctx.user?.id ?? null },
      }),
    );
  }

  return result;
});

function createRateLimitMiddleware(options: { limit: number; windowSeconds: number }) {
  return t.middleware(async ({ ctx, next, path }) => {
    const key = ctx.user?.id ?? ctx.meta.ip ?? 'anonymous';
    const result = await checkRateLimit({
      key: `${path}:${key}`,
      limit: options.limit,
      windowSeconds: options.windowSeconds,
    });

    if (!result.allowed) {
      throwRateLimited(result.retryAfterSeconds);
    }

    return next();
  });
}

const standardRateLimit = createRateLimitMiddleware({ limit: 120, windowSeconds: 60 });
const publicRateLimit = createRateLimitMiddleware({ limit: 30, windowSeconds: 60 });
const sensitiveRateLimit = createRateLimitMiddleware({ limit: 15, windowSeconds: 60 });

export const protectedProcedure = t.procedure
  .use(loggingMiddleware)
  .use(standardRateLimit)
  .use(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  });

/** Rate limit reforzado para consultas penal/fiscal y operaciones sensibles */
export const sensitiveProcedure = t.procedure
  .use(loggingMiddleware)
  .use(sensitiveRateLimit)
  .use(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  });

export const publicRateLimitedProcedure = t.procedure
  .use(loggingMiddleware)
  .use(publicRateLimit);

export const adminProcedure = t.procedure
  .use(loggingMiddleware)
  .use(sensitiveRateLimit)
  .use(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
    }
    if (ctx.user.role !== 'ADMIN') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Administrator access required' });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  });