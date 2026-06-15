import { getRedis } from '../lib/redis.js';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export interface RateLimitOptions {
  key: string;
  limit: number;
  windowSeconds: number;
}

export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { key, limit, windowSeconds } = options;
  const redis = getRedis();

  if (redis) {
    return checkRateLimitRedis(redis, key, limit, windowSeconds);
  }

  return checkRateLimitMemory(key, limit, windowSeconds);
}

async function checkRateLimitRedis(
  redis: NonNullable<ReturnType<typeof getRedis>>,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const redisKey = `ratelimit:${key}`;

  try {
    const multi = redis.multi();
    multi.incr(redisKey);
    multi.expire(redisKey, windowSeconds, 'NX');
    multi.ttl(redisKey);
    const results = await multi.exec();

    const rawCount = results?.[0]?.[1];
    const count = typeof rawCount === 'number' ? rawCount : 1;
    const rawTtl = results?.[2]?.[1];
    const ttl = typeof rawTtl === 'number' ? rawTtl : windowSeconds;

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: Math.max(1, ttl),
    };
  } catch {
    return checkRateLimitMemory(key, limit, windowSeconds);
  }
}

function checkRateLimitMemory(
  key: string,
  limit: number,
  windowSeconds: number,
): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || entry.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: windowSeconds };
  }

  entry.count += 1;
  const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));

  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    retryAfterSeconds,
  };
}

export function clearRateLimitMemory(): void {
  memoryStore.clear();
}