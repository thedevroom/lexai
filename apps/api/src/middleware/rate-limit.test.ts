import { afterEach, describe, expect, it } from 'vitest';
import { checkRateLimit, clearRateLimitMemory } from './rate-limit.js';

afterEach(() => {
  clearRateLimitMemory();
});

describe('checkRateLimit (memory fallback)', () => {
  it('permite solicitudes dentro del límite', async () => {
    const result = await checkRateLimit({
      key: 'test-user',
      limit: 5,
      windowSeconds: 60,
    });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('bloquea cuando se excede el límite', async () => {
    const opts = { key: 'test-blocked', limit: 2, windowSeconds: 60 };

    await checkRateLimit(opts);
    await checkRateLimit(opts);
    const third = await checkRateLimit(opts);

    expect(third.allowed).toBe(false);
    expect(third.retryAfterSeconds).toBeGreaterThan(0);
  });
});