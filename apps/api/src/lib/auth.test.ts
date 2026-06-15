import { describe, expect, it } from 'vitest';
import { createAuthToken, extractBearerToken, hashPassword, verifyAuthToken, verifyPassword } from './auth.js';

describe('auth', () => {
  it('hashea y verifica contraseñas', async () => {
    const hash = await hashPassword('password-segura-123');
    expect(await verifyPassword('password-segura-123', hash)).toBe(true);
    expect(await verifyPassword('incorrecta', hash)).toBe(false);
  });

  it('crea y verifica tokens JWT', async () => {
    const token = await createAuthToken({ id: 'user_test_123', email: 'test@lexai.es' });
    const payload = await verifyAuthToken(token);

    expect(payload?.sub).toBe('user_test_123');
    expect(payload?.email).toBe('test@lexai.es');
  });

  it('extrae bearer token del header', () => {
    expect(extractBearerToken('Bearer abc123')).toBe('abc123');
    expect(extractBearerToken('Basic xyz')).toBeNull();
    expect(extractBearerToken(undefined)).toBeNull();
  });
});