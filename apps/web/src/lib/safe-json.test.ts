import { describe, expect, it } from 'vitest';
import { mapPlainTextApiError, safeJsonParse } from './safe-json';

describe('safeJsonParse', () => {
  it('parses valid JSON objects', () => {
    const result = safeJsonParse<{ ok: boolean }>('{"ok":true}');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.ok).toBe(true);
  });

  it('rejects Vercel deploy plain text', () => {
    const raw = 'The deployment could not be found';
    const result = safeJsonParse(raw);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('API no está disponible');
    }
  });

  it('rejects HTML responses', () => {
    const result = safeJsonParse('<!DOCTYPE html><html></html>');
    expect(result.ok).toBe(false);
  });
});

describe('mapPlainTextApiError', () => {
  it('maps deployment errors', () => {
    expect(mapPlainTextApiError('The deploy failed')).toContain('API no está disponible');
  });
});