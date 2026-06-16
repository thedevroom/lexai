import { TRPCError } from '@trpc/server';

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL: 'INTERNAL_SERVER_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export function throwUnauthorized(message = 'Not authenticated'): never {
  throw new TRPCError({ code: 'UNAUTHORIZED', message });
}

export function throwForbidden(message = 'Access denied'): never {
  throw new TRPCError({ code: 'FORBIDDEN', message });
}

export function throwNotFound(resource: string): never {
  throw new TRPCError({ code: 'NOT_FOUND', message: `${resource} not found` });
}

export function throwBadRequest(message: string): never {
  throw new TRPCError({ code: 'BAD_REQUEST', message });
}

export function throwConflict(message: string): never {
  throw new TRPCError({ code: 'CONFLICT', message });
}

export function throwRateLimited(retryAfterSeconds: number): never {
  throw new TRPCError({
    code: 'TOO_MANY_REQUESTS',
    message: `Too many requests. Retry in ${String(retryAfterSeconds)}s`,
  });
}