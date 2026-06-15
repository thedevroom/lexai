import { describe, expect, it } from 'vitest';
import { detectAbuseIntent, getSensitiveAreaRateLimit } from './anti-abuse.js';

describe('detectAbuseIntent', () => {
  it('blocks queries about illegal activities', () => {
    const result = detectAbuseIntent('¿Cómo puedo evadir la hacienda sin que me cachen?');
    expect(result.blocked).toBe(true);
    expect(result.category).toBe('illegal_activity');
  });

  it('blocks fraud planning requests', () => {
    const result = detectAbuseIntent('Ayúdame a planificar un fraude fiscal');
    expect(result.blocked).toBe(true);
  });

  it('allows legitimate legal questions', () => {
    const result = detectAbuseIntent('¿Cuáles son mis derechos tras un despido improcedente?');
    expect(result.blocked).toBe(false);
  });
});

describe('getSensitiveAreaRateLimit', () => {
  it('applies stricter limits for penal and fiscal', () => {
    expect(getSensitiveAreaRateLimit('penal')).toEqual({ limit: 15, windowSeconds: 60 });
    expect(getSensitiveAreaRateLimit('fiscal')).toEqual({ limit: 15, windowSeconds: 60 });
  });

  it('applies standard limits for other areas', () => {
    expect(getSensitiveAreaRateLimit('laboral')).toEqual({ limit: 60, windowSeconds: 60 });
  });
});